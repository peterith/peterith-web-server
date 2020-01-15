import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectToDatabase } from './utils/database';
import { createContext } from './utils/apolloServer';
import typeDefs from './typeDefs';
import resolvers from './resolvers';
import models from './models';

dotenv.config();

connectToDatabase();
mongoose.connection.on('error', error => console.error(error));

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => createContext(req, models)
});

const app = express();
const port = process.env.PORT || 4000;
server.applyMiddleware({ app });
app.listen(port, () => {
  console.log(`Server ready at http://localhost:${port}/${server.graphqlPath}`);
});
