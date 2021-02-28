import { gql } from 'apollo-server-micro'

const typeDefs = gql`

  type Query {
    users(
      first: Int
      after: String
      last: Int
      before: String
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

  input AuthUserInput {
    email: String
    userName: String
  }

  input AuthInput {
    user: AuthUserInput!
    password: String
  }

  input UserInput {
    email: String
    name: String
    userName: String
    password: String
  }

  # implement edges and nodes for users
  type UsersConnection {
    edges: [UserEdge]!
    total: Int!
    pageInfo: PageInfo!
  }

  type UserEdge {
    cursor: String
    node: User!
  }

  type User {
    id: Int!
    uuid: String!
    name: String
    userName: String
    email: String!
    password: String!
  }

  type PageInfo {
    hasPreviousPage: Boolean!
    hasNextPage: Boolean!
    startCursor: String!
    endCursor: String!
  }
`

export default typeDefs