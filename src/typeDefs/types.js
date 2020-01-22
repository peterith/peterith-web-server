import { gql } from 'apollo-server-express';

export default gql`
  type User {
    token: String
    firstName: String
    lastName: String
    username: String
    email: String
    role: Role
    createdAt: String
    updatedAt: String
  }
`;
