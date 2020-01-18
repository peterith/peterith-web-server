import { gql } from 'apollo-server-express';

export default gql`
  type Response {
    success: Boolean!
    message: String!
  }

  type TokenResponse {
    success: Boolean!
    message: String!
    username: String
    token: String
  }

  type UserResponse {
    success: Boolean!
    message: String!
    user: User
  }

  type User {
    _id: ID
    firstName: String
    lastName: String
    username: String
    email: String
    role: Role
    createdAt: String
    updatedAt: String
  }
`;
