import mongoose from 'mongoose';
import { ApolloServer } from 'apollo-server-express';
import { createTestClient } from 'apollo-server-testing';
import models from '../models';
import { typeDefs, resolvers } from '../graphql';

export const setUp = async () => {
  await mongoose.connect('mongodb://localhost/test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });
  await models.User.create({
    firstName: 'John',
    lastName: 'Doe',
    username: 'johndoe',
    email: 'johndoe@mail.com',
    password: 'password',
  });
  return createTestClient(
    new ApolloServer({
      typeDefs,
      resolvers,
      context: {
        contextUser: await models.User.findOne({
          username: 'johndoe',
        }),
        db: models,
      },
    }),
  );
};

export const tearDown = async () => {
  await Promise.all(Object.keys(models).map((key) => models[key].deleteMany({})));
  await mongoose.connection.close();
};
