import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectToDatabase } from './utils/database';
import { createApolloServer } from './utils/apolloServer';

dotenv.config();

connectToDatabase();
mongoose.connection.on('error', error => console.error(error));

const server = createApolloServer();

const app = express();
const port = process.env.PORT || 4000;
server.applyMiddleware({ app });
app.listen(port, () => {
  console.log(`Server ready at http://localhost:${port}/${server.graphqlPath}`);
});
