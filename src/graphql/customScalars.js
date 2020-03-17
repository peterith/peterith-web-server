import { gql } from 'apollo-server-express';
import { GraphQLDateTime } from 'graphql-iso-date';

export const customScalarTypeDefs = gql`
  scalar Date
`;

export const customScalarResolvers = {
  Date: GraphQLDateTime,
};
