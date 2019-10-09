import { gql } from 'apollo-server-express';

export default gql`
  enum Role {
    PETE
    ADMIN
    USER
  }
`;
