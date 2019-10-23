import { gql } from 'apollo-server-express';

export default gql`
  type Query {
    login(user: UserInput!): TokenResponse!
    validateUsernameAvailability(username: String!): Response!
    validateEmailAvailability(email: String!): Response!
    getUser(username: String!): UserResponse!
  }
`;
