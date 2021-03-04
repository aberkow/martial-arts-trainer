import { gql } from 'apollo-server-micro'

const techniqueTypeDefs = gql`
  type TechniqueConnection {
    edges: [TechniqueEdge]!
    total: Int!
    pageInfo: PageInfo!
  }

  type TechniqueEdge {
    cursor: String
    node: Technique!
  }

  type Technique {
    id: Int!
    uuid: String!
    name: String!
    slug: String!
    description: String
    creator: User!
  }
`

export default techniqueTypeDefs