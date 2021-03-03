import { gql } from 'apollo-server-micro'

const authInputs = gql`
  input AuthUserInput {
    email: String
    userName: String
  }

  input AuthInput {
    user: AuthUserInput!
    password: String
  }
`

export default authInputs