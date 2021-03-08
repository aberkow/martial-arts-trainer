import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'
import tokenGenerator from '../../lib/tokenGenerator'
import { Context } from '../../pages/api/graphql'

export const userMutations = {
  login: async (_, { credentials }, ctx: Context) => {
    const { prisma, cookies } = ctx

    const where = {
      email: null,
      userName: null
    }

    if (credentials.user.email !== null && credentials.user.email !== '') {
      where.email = credentials.user.email
    } else {
      where.userName = credentials.user.userName
    }

    const user = await prisma.user.findUnique({ where })

    if (!user) {
      throw new Error('No user with that email or username found')
    }

    const isValid = await bcrypt.compare(credentials.password, user.password)

    if (!isValid) {
      throw new Error('Invalid password')
    }

    const token = tokenGenerator(user.uuid, user.email, '5m')
    const refreshToken = tokenGenerator(user.uuid, user.email, '1w')

    const tokenDate = new Date(Date.now() + 60 * 5 * 1000)
    const refreshDate = new Date(Date.now() + 60 * 60 * 24 * 7 * 1000)

    cookies.set('mat-token', token, {
      expires: tokenDate
    })
    cookies.set('mat-refresh-token', refreshToken, {
      expires: refreshDate
    })

    return user
  },
  createUser: async (_, { userData }, ctx: Context) => {

    const { prisma } = ctx

    const hashedPassword = bcrypt.hashSync(userData.password, 10)

    delete userData.password

    return await prisma.user.create({
      data: {
        uuid: uuidv4(),
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
        userName: userData.userName
      }
    })
  },
  updateUser: async (_, { userData }, ctx: Context) => {
    const { verifiedUser, prisma } = ctx
    const { user } = verifiedUser

    if (!user) throw new Error('Not authenticated')

    const updatedData = {}

    for (const key in userData) {
      if (Object.hasOwnProperty.call(userData, key)) {
        const element = userData[key];
        updatedData[key] = element
      }
    }

    return await prisma.user.update({
      where: {
        uuid: user.uuid
      },
      data: updatedData
    })
  },
  deleteUser: async (_, __, ctx: Context) => {

    const { verifiedUser, prisma } = ctx
    const { user } = verifiedUser

    if (!user) throw new Error('Not authenticated')

    return await prisma.user.delete({
      where: {
        uuid: user.uuid
      }
    })
  },
 }