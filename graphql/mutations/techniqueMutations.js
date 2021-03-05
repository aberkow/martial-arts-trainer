/*
*
* @typedef { import("@prisma/client").PrismaClient } Prisma
*
*/

import { v4 as uuidv4 } from 'uuid'
import slugify from '@sindresorhus/slugify'

/**
 *
 * @param {any} parent
 * @param {object} args
 * @param {{ prisma: Prisma }} ctx
 */

module.exports = {
  createTechnique: async (_, { techniqueData }, { verifiedUser, prisma }) => {

    const { user } = verifiedUser

    if (!user) throw new Error('Not authenticated')

    const connect = {}

    for (const key in user) {
      if (key === 'email' || key === 'uuid') {
        connect[key] = user[key]
      }
    }

    return await prisma.technique.create({
      data: {
        creator: { connect },
        uuid: uuidv4(),
        name: techniqueData.name,
        description: techniqueData.description,
        slug: slugify(techniqueData.name)
      },
      include: {
        creator: true
      }
    })
  }
}