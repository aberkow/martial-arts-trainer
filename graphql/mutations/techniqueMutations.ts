import { v4 as uuidv4 } from 'uuid'
import slugify from '@sindresorhus/slugify'

import connectToUser from '../../lib/connectToUser'
import { Context } from '../../pages/api/graphql'

export const techniqueMutations = {
  createTechnique: async (_, { techniqueData }, ctx: Context) => {
    const uuid = uuidv4()
    const slug = `${slugify(techniqueData.name)}-${uuid.substr(0, 8)}`

    const { prisma, verifiedUser } = ctx
  
    const connectedUser = connectToUser(verifiedUser)

    return await prisma.technique.create({
      data: {
        creator: { 
          connect: connectedUser 
        },
        uuid,
        name: techniqueData.name,
        description: techniqueData.description,
        slug
      },
      include: {
        creator: true
      }
    })
  },
  updateTechnique: async (_, { techniqueID, techniqueData }, { verifiedUser, prisma }: Context) => {
    
    const { user } = verifiedUser

    if (!user) throw new Error('Not authenticated')

    return await prisma.technique.update({
      where: {
        uuid: techniqueID
      },
      data: {
        ...techniqueData
      },
      include: {
        creator: true
      }
    })
  },
  deleteTechnique: async(_, { techniqueID }, { verifiedUser, prisma }: Context) => {

    const { user } = verifiedUser

    if (!user) throw new Error('Not authenticated')

    return await prisma.technique.delete({
      where: {
        uuid: techniqueID
      }
    })
  }
}