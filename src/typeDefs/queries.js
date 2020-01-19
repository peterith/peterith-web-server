import { gql } from 'apollo-server-express';

export default gql`
  type Query {
    login(user: UserInput!): User!
    validateUsernameAvailability(username: String!): Boolean!
    validateEmailAvailability(email: String!): Boolean!
    getUser(username: String!): User!
  }
`;
