import { gql } from 'apollo-server-micro'

const sequenceTypeDefs = gql`
  scalar Json

  type SequencesConnection {
    edges: [SequenceEdge]!
    total: Int!
    pageInfo: PageInfo!
  }

  type SequenceEdge {
    cursor: String
    node: Sequence!
  }

  type Sequence {
    id: Int!
    uuid: String!
    name: String!
    slug: String!
    description: String
    creator: User!
    techniques: [TechniquesConnection]!
    techniqueOrder: Json
  }
`

export default sequenceTypeDefs