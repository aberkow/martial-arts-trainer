import { ApolloServer } from 'apollo-server-micro'
import Cors from 'micro-cors'
import bcrypt from 'bcrypt'
import Cookies from 'cookies'
import { verify } from 'jsonwebtoken'

import typeDefs from '../../graphql/typeDefs'

const resolvers = {

}

const cors = Cors({
  allowMethods: ["GET", "POST"]
})

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers
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