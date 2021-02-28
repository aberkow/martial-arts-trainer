import { ApolloServer } from 'apollo-server-micro'
import Cors from 'micro-cors'
import bcrypt from 'bcrypt'
import Cookies from 'cookies'
import { verify } from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import dotenv from 'dotenv'

import typeDefs from '../../graphql/typeDefs'
import prisma from '../../prisma/prisma'
import tokenGenerator from '../../lib/tokenGenerator'
import { cursorGenerator, cursorDecoder, isBackwardPagination, isForwardPagination } from '../../lib/pagination'

dotenv.config()

const resolvers = {
  Query: {
    users: async (_, args, { prisma }) => {
      // based around - https://github.com/devoxa/prisma-relay-cursor-connection/blob/master/src/index.ts

      let nodes = []
      let hasNextPage = false
      let hasPreviousPage = false

      if (isForwardPagination(args)) {

        // the most we'll allow to first to be is 100
        const first = args.first > 100 ? 100 : args.first

        // take 1 extra node
        const take = Math.abs(first + 1)

        // if there's a cursor, decode it
        const cursorID = args.after ? cursorDecoder(args.after) : null

        // if there's a cursor, we need to apply a skip
        const skip = cursorID ? 1 : 0

        // set up args for findMany
        const prismaArgs = {
          take,
          skip,
        }
        
        // if there's a decoded cursor ID, apply that to the args
        if (cursorID) {
          prismaArgs.cursor = {
            id: cursorID
          }
        }

        // assign nodes to the result
        nodes = await prisma.user.findMany(prismaArgs)

        // if there was an args.after, then there was a previous page
        hasPreviousPage = !!args.after

        // if the total number of nodes is more than the clamped value of "first" there is a next page
        hasNextPage = nodes.length > first

        // before returning, discard the last entry from the nodes
        if (hasNextPage) nodes.pop()
      } else if (isBackwardPagination(args)) {

        const last = args.last > 100 ? 100 : args.last

        const take = (Math.abs(last + 1)) * -1

        const cursorID = args.before ? cursorDecoder(args.before) : null
        const skip = cursorID ? 1 : 0

        // set up args for findMany
        const prismaArgs = {
          take,
          skip,
        }

        // if there's a decoded cursor ID, apply that to the args
        if (cursorID) {
          prismaArgs.cursor = {
            id: cursorID
          }
        }

        nodes = await prisma.user.findMany(prismaArgs)

        console.log({take, length: nodes.length, prismaArgs });

        hasPreviousPage = !!args.before

        console.log({ length: nodes.length, last });

        hasNextPage = nodes.length > last

        if (hasPreviousPage) nodes.shift()
      } else {
        // if there are no other params, just take 10
        nodes = await prisma.user.findMany({
          take: 10
        })
      }

      // assign page info
      const lastUser = nodes[nodes.length - 1]

      const pageInfo = {
        hasPreviousPage,
        hasNextPage,
        startCursor: cursorGenerator('user', nodes[0]['id']),
        endCursor: cursorGenerator('user', lastUser.id),
      }

      // create edges
      const edges = nodes.map(user => {
        return { 
          cursor: cursorGenerator('user', user.id),
          node: user 
        }
      })

      return {
        edges,
        pageInfo,
        total: edges.length
      }
    },
  },
  Mutation: {
    login: async (_, { credentials }, context) => {
      const cookies = context.cookies

      const where = {}

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
    createUser: async (_, { userData }, { prisma }) => {

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
    updateUser: async (_, { userData }, { verifiedUser, prisma }) => {
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
    deleteUser: async (_, __, { verifiedUser, prisma }) => {
      const { user } = verifiedUser
      if (!user) throw new Error('Not authenticated')

      return await prisma.user.delete({ 
        where: {
          uuid: user.uuid
        }
      })
    }
  }
}

const cors = Cors({
  allowMethods: ["GET", "POST", "OPTIONS"]
})

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }) => {

    const cookies = new Cookies(req, res, { 
      keys: [ process.env.COOKIE_KEY ]
    })

    const context = {
      prisma,
      response: res,
      cookies
    }

    if (req.headers.authorization !== undefined) {
      const refreshToken = cookies.get('mat-refresh-token')

      const authHeader = req.headers.authorization
      const payload = authHeader.replace('Bearer', '').trim()

      const verified = verify(payload, "secret!!", (err, decoded) => {
        return err ? false : decoded
      })

      const verifiedRefreshToken = verify(refreshToken, 'secret!!', (err, decoded) => {
        return err ? false : decoded
      })

      /**
       * If both tokens fail, return the context immediately
       * Let the resolvers handle any errors
       * Redirect back to login
       */
      if (!verified && !verifiedRefreshToken) {
        cookies.set('ma-app-token')
        cookies.set('ma-app-refresh-token')
        return context
      } 
      /**
       * If the token fails, but the refresh token is still good
       * - create new tokens to send back as cookies
       * - then use the verified refresh token to add the user to the context
       */
      else if (!verified && verifiedRefreshToken) {

        const token = tokenGenerator(verifiedRefreshToken.id, verifiedRefreshToken.email, '5m')
        const refreshToken = tokenGenerator(verifiedRefreshToken.id, verifiedRefreshToken.email, '1w')

        const tokenDate = new Date(Date.now() + 60 * 5 * 1000)
        const refreshDate = new Date(Date.now() + 60 * 60 * 24 * 7 * 1000)

        // then create and send new tokens
        cookies.set('mat-token', token, {
          expires: tokenDate
        })
        cookies.set('mat-refresh-token', refreshToken, {
          expires: refreshDate
        })

        const user = verifiedRefreshToken

        context.verifiedUser = { user }
      } else if (verified && verifiedRefreshToken) {
        const user = verified
        context.verifiedUser = { user }
      }
    }

    return context
  },
  playground: process.env.VERCEL_ENV !== 'production' ? true : false,
  introspection: process.env.VERCEL_ENV !== 'production' ? true : false
})

// required as per https://nextjs.org/docs/api-routes/api-middlewares#custom-config
export const config = {
  api: {
    bodyParser: false
  }
}

const handler = apolloServer.createHandler({
  path: '/api/graphql',
})

export default cors(handler)