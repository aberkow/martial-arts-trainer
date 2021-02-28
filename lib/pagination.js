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