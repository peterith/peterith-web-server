import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import mongoose from 'mongoose';
import { createContext } from './utils/apolloServer';
import { typeDefs, resolvers } from './graphql';
import models from './models';

try {
  mongoose.connect(`${process.env.DB_PREFIX}://${process.env.DB_HOST}`, {
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
    dbName: process.env.DB_NAME,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });
  mongoose.connection.on('connected', () => {
    console.log(`Connected to MongoDB at ${process.env.DB_HOST} (${process.env.DB_NAME})`);
  });
  mongoose.connection.on('error', (error) => {
    console.error(error);
  });

  if (process.env.NODE_ENV !== 'production') {
    mongoose.set('debug', true);
  }
} catch (error) {
  console.error(error);
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => createContext(req, models, mongoose),
});

const app = express();
server.applyMiddleware({
  app,
  cors: {
    origin: process.env.CORS_ORIGIN,
  },
});

app.listen(process.env.PORT, () => {
  console.log(`Server ready at http://localhost:${process.env.PORT}/${server.graphqlPath}`);
});
