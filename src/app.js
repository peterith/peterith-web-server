import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createContext } from './utils/apolloServer';
import typeDefs from './typeDefs';
import resolvers from './resolvers';
import models from './models';

dotenv.config();
const { DB_SCHEME, DB_USER, DB_PASS, DB_HOST, DB_CLUSTER, PORT } = process.env;

try {
  mongoose.connect(`${DB_SCHEME}://${DB_USER}:${DB_PASS}@${DB_HOST}/${DB_CLUSTER}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });
} catch (error) {
  console.error(error);
}
mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB at ${DB_HOST} (${DB_CLUSTER})`);
});
mongoose.connection.on('error', (error) => console.error(error));

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    return createContext(req, models);
  },
});

const app = express();
server.applyMiddleware({ app });
app.listen(PORT, () => {
  console.log(`Server ready at http://localhost:${PORT}/${server.graphqlPath}`);
});
