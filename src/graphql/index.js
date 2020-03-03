import { merge } from 'lodash';
import { gql } from 'apollo-server-express';
import { storyTypeDefs, storyResolvers } from './story';
import { userTypeDefs, userResolvers } from './user';

const query = gql`
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;

export const typeDefs = [query, storyTypeDefs, userTypeDefs];

export const resolvers = merge(storyResolvers, userResolvers);
