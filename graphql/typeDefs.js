import { gql } from 'apollo-server-micro'

import userTypeDefs from './types/userTypeDefs'
import utilityTypeDefs from './types/utilityTypeDefs'

import authInputs from './inputs/authInputs'
import userInputs from './inputs/userInputs'

const queryAndMutationTypes = gql`

  type Query {
    users(
      first: Int
      after: String
      last: Int
      before: String
      where: UserWhereInput
    ): UsersConnection!
    me: User
  }

  type Mutation {
    login(credentials: AuthInput!): User!
    # all CRUD operations require a successful login. user ID's etc. 
    # will only be provided by the app context
    createUser(userData: UserInput!): User!
    updateUser(userData: UserInput!): User
    deleteUser: User
  }
`

// apollo server allows typeDefs to be an array of gql strings
const typeDefs = [
  queryAndMutationTypes,
  utilityTypeDefs,
  userTypeDefs,
  userInputs,
  authInputs
]

export default typeDefs