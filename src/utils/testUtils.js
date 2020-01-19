import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { ApolloServer } from 'apollo-server-express';
import { createTestClient } from 'apollo-server-testing';
import models from '../models';
import typeDefs from '../typeDefs';
import resolvers from '../resolvers';

export const setUp = async () => {
  dotenv.config();
  await setUpTestDatabase();
  return createTestClient(
    new ApolloServer({
      typeDefs,
      resolvers,
      context: () => ({ user: 'johndoe', db: models })
    })
  );
};

export const setUpTestDatabase = async () => {
  await mongoose.connect('mongodb://localhost/test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  });
};

export const tearDown = async () => {
  await Promise.all(Object.keys(models).map(key => models[key].deleteMany({})));
  await mongoose.connection.close();
};
