import { gql } from 'apollo-server-express';

export default gql`
  type Mutation {
    registerUser(user: UserInput!): Response!
    updateUser(user: UserInput!): TokenResponse!
  }
`;
