import { gql } from 'apollo-server-micro'

const sequenceInputs = gql`
  input SequenceTechniqueInput {
    id: ID!
  }

  input SequenceTechniqueOrderInput {
    techniqueId: ID!
  }

  input SequenceInput {
    name: String
    description: String
    techniques: [SequenceTechniqueInput]!
    techniqueOrder: [SequenceTechniqueOrderInput]!
  }
`

export default sequenceInputs