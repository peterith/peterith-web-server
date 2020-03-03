import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createContext } from './utils/apolloServer';
import { typeDefs, resolvers } from './graphql';
import models from './models';

dotenv.config();
const { DB_PREFIX, DB_CREDENTIALS, DB_HOST, DB_DATABASE, DB_OPTIONS, PORT } = process.env;

try {
  mongoose.connect(`${DB_PREFIX}://${DB_CREDENTIALS}${DB_HOST}/${DB_DATABASE}${DB_OPTIONS}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });
  mongoose.set('debug', true);
  mongoose.connection.on('connected', () => {
    console.log(`Connected to MongoDB at ${DB_HOST} (${DB_DATABASE})`);
  });
  mongoose.connection.on('error', (error) => console.error(error));
} catch (error) {
  console.error(error);
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => createContext(req, models),
});

const app = express();
server.applyMiddleware({ app });
app.listen(PORT, () => {
  console.log(`Server ready at http://localhost:${PORT}/${server.graphqlPath}`);
});
