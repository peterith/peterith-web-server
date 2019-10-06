import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
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
  resolvers,
  context: ({ req }) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const username = decoded.sub;

        return { username };
      } catch (error) {
        return {};
      }
    }
  }
});

const app = express();
const port = process.env.PORT || 4000;

server.applyMiddleware({ app });
app.listen(port);
