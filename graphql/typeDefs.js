import { gql } from 'apollo-server-micro'

const typeDefs = gql`

  type Query {
    users: UsersConnection!
    me: User
  }

  type Mutation {
    login(credentials: AuthInput!): User!
    createUser(userData: UserInput!): User!
    updateUser(uuid: String! userData: UserInput): User
    deleteUser(uuid: String!): User
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
    total: Int
  }

  type UserEdge {
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
`

export default typeDefs