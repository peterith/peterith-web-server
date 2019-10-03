import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { typeDefs, resolvers } from './graphql/users';

dotenv.config();

mongoose.connect(
  `${process.env.DB_SCHEME}://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_CLUSTER}`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  }
);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));

const server = new ApolloServer({
  typeDefs,
  resolvers
});

const app = express();

server.applyMiddleware({ app });
app.listen(process.env.PORT);
