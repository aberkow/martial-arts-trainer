import { v4 as uuidv4 } from 'uuid'
import slugify from '@sindresorhus/slugify'

import connectToUser from '../../lib/connectToUser'
import { Context } from '../../pages/api/graphql'

export const techniqueMutations = {
  createTechnique: async (_, { techniqueData }, ctx: Context) => {
    let slug = ''

    const { prisma, verifiedUser } = ctx
  
    const connectedUser = connectToUser(verifiedUser)
    // const countableSlug = slugify.counter()
    // const slug = slugify(techniqueData.name)
  
    // const lastWithSlug = await prisma.technique.findMany({
    //   take: -1,
    //   where: {
    //     slug: {
    //       contains: slug
    //     }
    //   }
    // })

    // if (lastWithSlug.length > 0) {
    //   slug = countableSlug(lastWithSlug[lastWithSlug.length - 1]['slug'])
    //   console.log({ slug });
      
    // } else {
    //   slug = slugify(techniqueData.name)
    // }


    // console.log({ lastWithSlug, slug });
    

    return await prisma.technique.create({
      data: {
        creator: { 
          connect: connectedUser 
        },
        uuid: uuidv4(),
        name: techniqueData.name,
        description: techniqueData.description,
        slug: slugify(techniqueData.name)
      },
      include: {
        creator: true
      }
    })
  },
  updateTechnique: async(_, { techniqueData }, { verifiedUser, prisma }: Context) => {
    
    return true
  },
  deleteTechnique: async(_, { techniqueID }, { verifiedUser, prisma }: Context) => {
    return true
  }
}