import { ApolloServer } from 'apollo-server-micro'
import Cors from 'micro-cors'
import Cookies from 'cookies'
const jsonwebtoken = require('jsonwebtoken')
import dotenv from 'dotenv'

import typeDefs from '../../graphql/typeDefs'
import prisma from '../../prisma/prisma'
import tokenGenerator from '../../lib/tokenGenerator'

import { userQueries } from '../../graphql/queries/userQueries'
import { userMutations } from '../../graphql/mutations/userMutations'
import { techniqueMutations } from '../../graphql/mutations/techniqueMutations'
import { sequenceMutations } from '../../graphql/mutations/sequenceMutations'

dotenv.config()

export interface Context {
  prisma: typeof prisma,
  verifiedUser: { user: any },
  response: Response,
  cookies: Cookies
}

const resolvers = {
  Query: {
    users: async (_, args, ctx) => userQueries.users(_, args, ctx),
    me: async (_, __, ctx) => userQueries.me(_, __, ctx),
  },
  Mutation: {
    login: async (_, args, ctx) => userMutations.login(_, args, ctx),
    createUser: async (_, args, ctx) => userMutations.createUser(_, args, ctx),
    updateUser: async (_, args, ctx) => userMutations.updateUser(_, args, ctx),
    deleteUser: async (_, __, ctx) => userMutations.deleteUser(_, __, ctx),
    createTechnique: async (_, args, ctx) => techniqueMutations.createTechnique(_, args, ctx),
    updateTechnique: async (_, args, ctx) => techniqueMutations.updateTechnique(_, args, ctx),
    deleteTechnique: async (_, args, ctx) => techniqueMutations.deleteTechnique(_, args, ctx),
    createSequence: async (_, args, ctx) => sequenceMutations.createSequence(_, args, ctx),
    updateSequence: async (_, args, ctx) => sequenceMutations.updateSequence(_, args, ctx),
    deleteSequence: async (_, args, ctx) => sequenceMutations.deleteSequence(_, args, ctx),
  }
}

const cors = Cors({
  allowMethods: ["GET", "POST", "OPTIONS"]
})

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }) => {

    const cookies = new Cookies(req, res, { 
      keys: [ process.env.COOKIE_KEY ]
    })

    const context: Context = {
      prisma,
      response: res,
      cookies,
      verifiedUser: { user: {} }
    }

    if (req.headers.authorization !== undefined) {
      const refreshToken = cookies.get('mat-refresh-token')

      const authHeader = req.headers.authorization
      const payload = authHeader.replace('Bearer', '').trim()

      const verified = jsonwebtoken.verify(payload, "secret!!", (err, decoded) => {
        return err ? false : decoded
      })

      const verifiedRefreshToken = jsonwebtoken.verify(refreshToken, 'secret!!', (err, decoded) => {
        return err ? false : decoded
      })

      /**
       * If both tokens fail, return the context immediately
       * Let the resolvers handle any errors
       * Redirect back to login
       */
      if (!verified  && verifiedRefreshToken !== null) {
        cookies.set('ma-app-token')
        cookies.set('ma-app-refresh-token')
        return context
      } 
      /**
       * If the token fails, but the refresh token is still good
       * - create new tokens to send back as cookies
       * - then use the verified refresh token to add the user to the context
       */
      else if (!verified && verifiedRefreshToken) {

        const token = tokenGenerator(verifiedRefreshToken.id, verifiedRefreshToken.email, '5m')
        const refreshToken = tokenGenerator(verifiedRefreshToken.id, verifiedRefreshToken.email, '1w')

        const tokenDate = new Date(Date.now() + 60 * 5 * 1000)
        const refreshDate = new Date(Date.now() + 60 * 60 * 24 * 7 * 1000)

        // then create and send new tokens
        cookies.set('mat-token', token, {
          expires: tokenDate
        })
        cookies.set('mat-refresh-token', refreshToken, {
          expires: refreshDate
        })

        const user = verifiedRefreshToken

        context.verifiedUser = { user }
      } else if (verified && verifiedRefreshToken) {
        const user = verified
        context.verifiedUser = { user }
      }
    }

    return context
  },
  playground: process.env.VERCEL_ENV !== 'production' ? true : false,
  introspection: process.env.VERCEL_ENV !== 'production' ? true : false
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