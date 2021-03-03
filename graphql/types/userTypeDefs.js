import { gql } from 'apollo-server-micro'

const userTypeDefs = gql`
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
`

export default userTypeDefs