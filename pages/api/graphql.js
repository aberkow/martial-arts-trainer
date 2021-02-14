import { ApolloServer } from 'apollo-server-micro'
import Cors from 'micro-cors'
import bcrypt from 'bcrypt'
import Cookies from 'cookies'
import { verify } from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'

import typeDefs from '../../graphql/typeDefs'
import prisma from '../../prisma/prisma'

const resolvers = {
  Query: {

  },
  Mutation: {
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
    const context = {
      prisma,
      response: res
    }

    return context
  }
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