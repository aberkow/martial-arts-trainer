import { gql } from 'apollo-server-micro'

const utilityTypeDefs = gql`
  type PageInfo {
    hasPreviousPage: Boolean!
    hasNextPage: Boolean!
    startCursor: String!
    endCursor: String!
  }
`

export default utilityTypeDefs