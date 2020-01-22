import { gql } from 'apollo-server-express';

export default gql`
  type Query {
    login(user: UserInput!): User!
    getUser(username: String!): User!
    validateUsernameAvailability(username: String!): Boolean!
    validateEmailAvailability(email: String!): Boolean!
  }
`;
