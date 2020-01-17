import { ApolloServer } from 'apollo-server-express';
import jwt from 'jsonwebtoken';
import typeDefs from '../typeDefs';
import resolvers from '../resolvers';
import models from '../models';

const getUserFromRequestHeaders = ({ authorization }) => {
  try {
    const token = authorization.split(' ')[1];
    return jwt.verify(token, process.env.SECRET_KEY).sub;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const createContext = ({ headers }, db) => ({
  user: getUserFromRequestHeaders(headers),
  db
});

export const createApolloServer = () =>
  new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => createContext(req, models)
  });

export const createTestServer = () =>
  new ApolloServer({
    typeDefs,
    resolvers,
    context: () => ({ user: 'peterith', db: models })
  });
