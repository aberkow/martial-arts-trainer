import { gql } from 'apollo-server-micro'

import userTypeDefs from './types/userTypeDefs'
import utilityTypeDefs from './types/utilityTypeDefs'
import sequenceTypeDefs from './types/sequenceTypeDefs'
import techniqueTypeDefs from './types/techniqueTypeDefs'

import authInputs from './inputs/authInputs'
import sequenceInputs from './inputs/sequenceInputs'
import techniqueInputs from './inputs/techniqueInputs'
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
    techniques(
      first: Int
      after: String
      last: Int
      before: String
    ): TechniquesConnection!
    technique(techniqueID: String): Technique
  }

  type Mutation {
    login(credentials: AuthInput!): User!
    # all CRUD operations require a successful login. user ID's etc. 
    # will only be provided by the app context
    createUser(userData: UserInput!): User!
    updateUser(userData: UserInput!): User
    deleteUser: User
    createTechnique(techniqueData: TechniqueInput!): Technique!
    updateTechnique(techniqueData: TechniqueInput!): Technique!
    deleteTechnique(techniqueID: String!): Technique
    createSequence(sequenceData: SequenceInput!): Sequence!
    updateSequence(sequenceData: SequenceInput!): Sequence!
    deleteSequence(sequenceId: String): Boolean!
  }
`

// apollo server allows typeDefs to be an array of gql strings
const typeDefs = [
  queryAndMutationTypes,
  techniqueTypeDefs,
  userTypeDefs,
  utilityTypeDefs,
  sequenceTypeDefs,
  authInputs,
  sequenceInputs,
  techniqueInputs,
  userInputs,
]

export default typeDefs