import { cursorGenerator, paginateWithCursors } from '../../lib/pagination'
import { Context } from '../../pages/api/graphql'

export const techniqueQueries = {
  techniques: async (_, args, ctx: Context) => {

    const { nodes, pageInfo } = await paginateWithCursors({
      prisma: ctx.prisma,
      args,
      type: 'technique'
    })

    const edges = nodes.map(technique => {
      return {
        cursor: cursorGenerator('technique', technique.id),
        node: technique
      }
    })

    return {
      edges,
      pageInfo,
      total: edges.length
    }
  },
  technique: async (_, { techniqueID }, ctx: Context) => {    
    return await ctx.prisma.technique.findUnique({
      where: {
        uuid: techniqueID
      },
      include: {
        creator: true
      }
    })
  }
}