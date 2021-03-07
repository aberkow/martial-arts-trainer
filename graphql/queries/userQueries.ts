import { cursorGenerator, paginateWithCursors } from '../../lib/pagination'
import { Context } from '../../pages/api/graphql'

export const userQueries = {
  users: async (_, args, { prisma }: Context) => {
    
    const { nodes, pageInfo } = await paginateWithCursors({
      prisma,
      args,
      type: 'user',
    })

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
  me: async (_, __, { verifiedUser, prisma }: Context) => {

    const { user } = verifiedUser

    if (!user) {
      throw new Error('Not authenticated')
    }

    const where = {}

    for (const key in user) {
      if (key === 'email' || key === 'uuid') {
        where[key] = user[key]
      }
    }

    const found = await prisma.user.findUnique({ where })

    const techniques = await paginateWithCursors({
      prisma,
      args: {
        where: {
          creatorId: found.uuid
        }
      },
      type: 'technique'
    })

    const techniqueEdges = techniques.nodes.map(technique => {
      return {
        cursor: cursorGenerator('technique', technique.id),
        node: technique
      }
    })

    return {
      ...found,
      techniques: {
        edges: techniqueEdges,
        pageInfo: techniques.pageInfo,
        total: techniqueEdges.length
      }
    }
  }
}