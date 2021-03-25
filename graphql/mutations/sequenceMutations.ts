import { v4 as uuidv4 } from 'uuid'
import slugify from '@sindresorhus/slugify'

import connectToUser from '../../lib/connectToUser'
import { Context } from '../../pages/api/graphql'
import prisma from '../../prisma/prisma'

export const sequenceMutations = {
  createSequence: async (_, { sequenceData }, ctx: Context) => {
    const connectedUser = connectToUser(ctx.verifiedUser)

    const uuid = uuidv4()
    const slug = `${slugify(sequenceData.name)}-${uuid.substr(0, 8)}`

    const techniqueIDs = sequenceData.techniques.map(({ uuid }) => uuid)

    const createdTechniqueOrder = sequenceData.techniqueOrder.map(({ techniqueID }) => {
      return {
        "techniqueId": parseInt(techniqueID)
      }
    })

    const techniques = await prisma.technique.findMany({
      where: {
        uuid: {
          in: techniqueIDs
        }
      }
    })

    const createdSequence = await prisma.sequence.create({
      data: {
        creator: {
          connect: connectedUser
        },
        uuid,
        slug,
        name: sequenceData.name,
        description: sequenceData.description,
        techniqueOrder: {
          "order": createdTechniqueOrder
        },
      },
      include: {
        creator: true,
        techniquesOnSequences: true
      }
    })

    return createdSequence
  },
  updateSequence: async (_, { sequenceData }, ctx: Context) => {

  },
  deleteSequence: async (_, { sequenceData }, ctx: Context) => {

  },
}