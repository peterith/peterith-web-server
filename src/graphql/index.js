import { merge } from 'lodash';
import { gql } from 'apollo-server-express';
import { calendarEventTypeDefs, calendarEventResolvers } from './calendarEvent';
import { customScalarTypeDefs, customScalarResolvers } from './customScalars';
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

export const typeDefs = [calendarEventTypeDefs, customScalarTypeDefs, query, storyTypeDefs, userTypeDefs];

export const resolvers = merge(calendarEventResolvers, customScalarResolvers, storyResolvers, userResolvers);