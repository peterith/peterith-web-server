import { gql } from 'apollo-server-express';

export default gql`
  type Query {
    login(user: UserInput!): LoginResponse!
    checkUsername(username: String!): Response!
    checkEmail(email: String!): Response!
    me: UserResponse!
  }
`;
