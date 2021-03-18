export const cursorGenerator = (type = '', id = 0) => {
  return Buffer.from(`${type}:${id}`).toString('base64')
}

export const cursorDecoder = (cursor = '') => {
  const decoded = Buffer.from(cursor, 'base64').toString()
  const parts = decoded.split(':')
  return parseInt(parts[1])
}

export const isForwardPagination = args => {
  return args && args.first !== undefined ? true : false
}

export const isBackwardPagination = args => {
  return args && args.last !== undefined ? true : false
}

/**
 * based around - https://github.com/devoxa/prisma-relay-cursor-connection/blob/master/src/index.ts
 * 
 * Relay style cursor pagination. See - https://relay.dev/graphql/connections.htm
 * 
 * @param {object} config 
 * @param  {...any} rest 
 * @returns {object} queried and paginated nodes with page info
 */
export const paginateWithCursors = async (config = {
  prisma,
  args,
  type: 'users',
}) => {

  const { prisma, args, type } = config

  console.log({ paginateArgs: args });

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

    if (args.where && Object.keys(args.where).length !== 0) {
      prismaArgs.where = args.where
    }

    console.log({prismaArgs});

    // assign nodes to the result
    nodes = await prisma[type].findMany(prismaArgs)

    // if there was an args.after, then there was a previous page
    hasPreviousPage = !!args.after

    // if the total number of nodes is more than the clamped value of "first" there is a next page
    hasNextPage = nodes.length > first

    // before returning, discard the last entry from the nodes
    if (hasNextPage) nodes.pop()
  } else if (isBackwardPagination(args)) {
    const last = args.last > 100 ? 100 : args.last

    // prisma requires a negative number to paginate backwards
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

    if (args.where && Object.keys(args.where).length !== 0) {
      prismaArgs.where = args.where
    }

    nodes = await prisma[type].findMany(prismaArgs)

    hasPreviousPage = !!args.before

    hasNextPage = nodes.length > last

    // make sure that when we get to the start of the list, we _don't_ shift the array
    if (hasPreviousPage && hasNextPage) nodes.shift()
  } else {

    const prismaArgs = {
      take: 10
    }

    if (args.where && Object.keys(args.where).length !== 0) {
      prismaArgs.where = args.where
    }

    // if there are no other params, just take 10
    nodes = await prisma[type].findMany(prismaArgs)
  }

  const lastOfType = nodes[nodes.length - 1]

  const pageInfo = {
    hasPreviousPage,
    hasNextPage,
    startCursor: cursorGenerator(type, nodes[0]['id']),
    endCursor: cursorGenerator(type, lastOfType.id)
  }

  return { 
    nodes, 
    pageInfo 
  }
}