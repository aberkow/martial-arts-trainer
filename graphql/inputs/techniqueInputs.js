import { gql } from 'apollo-server-micro'

const techniqueInputs = gql`
  input TechniqueInput {
    name: String!
    description: String
  }
`

export default techniqueInputs