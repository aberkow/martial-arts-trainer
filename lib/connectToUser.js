const connectToUser = ({ user }) => {
  if (!user) throw new Error('Not authenticated')

  const connection = {}

  for (const key in user) {
    if (key === 'email' || key === 'uuid') {
      connection[key] = user[key]
    }
  }

  return connection
}

export default connectToUser