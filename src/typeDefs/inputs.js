import { gql } from 'apollo-server-express';

export default gql`
  input UserInput {
    firstName: String
    lastName: String
    username: String
    email: String
    password: String
  }
`;
