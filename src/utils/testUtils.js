import mongoose, { models } from 'mongoose';
import { ApolloServer } from 'apollo-server-express';
import { createTestClient } from 'apollo-server-testing';
import { typeDefs, resolvers } from '../graphql';
import '../models';

export const setUpDatabaseAndClient = async (user) => {
  await setUpDatabase();
  return setUpClient(user);
};

export const setUpDatabase = async () => {
  await mongoose.connect('mongodb://localhost/test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });
  await Promise.all(Object.keys(models).map((key) => models[key].deleteMany()));
};

export const setUpClient = (user) => {
  return createTestClient(
    new ApolloServer({
      typeDefs,
      resolvers,
      context: { user, models, mongoose },
    }),
  );
};

export const tearDown = async () => {
  await Promise.all(Object.keys(models).map((key) => models[key].deleteMany()));
  await mongoose.connection.close();
};
