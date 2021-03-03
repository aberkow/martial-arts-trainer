import { gql } from 'apollo-server-micro'

const userInputs = gql`
    input UserInput {
    email: String
    name: String
    userName: String
    password: String
  }

  input UserWhereInput {
    name: String
    userName: String
  }
`

export default userInputs
