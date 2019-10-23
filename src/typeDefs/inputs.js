import { gql } from 'apollo-server-express';

export default gql`
  input UserInput {
    _id: ID
    firstName: String
    lastName: String
    username: String
    email: String
    password: String
    oldPassword: String
    role: [Role]
  }
`;
