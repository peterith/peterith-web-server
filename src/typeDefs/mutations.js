import { gql } from 'apollo-server-express';

export default gql`
  type Mutation {
    registerUser(user: UserInput!): User!
    updateUser(user: UserInput!, oldPassword: String!): User!
    deleteUser(password: String!): User!
  }
`;
