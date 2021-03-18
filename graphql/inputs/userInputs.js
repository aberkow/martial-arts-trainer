import { gql } from 'apollo-server-micro'

const userInputs = gql`
  input UserInput {
    email: String
    name: String
    userName: String
    password: String
  }

  # connect a user as a creator of a technique, sequence, etc
  input CreatorWhereInput {
    creator: UserWhereInput
  }

  input UserWhereInput {
    name: String
    userName: String
  }
`

export default userInputs
