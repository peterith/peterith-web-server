import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import models from '../models';
import { createTestClient } from 'apollo-server-testing';
import { createTestServer } from './apolloServer';

const insertTestData = async () => {
  await models.User.create({
    firstName: 'Peerapong',
    lastName: 'Rithisith',
    email: 'p.rithisith@hotmail.com',
    username: 'peterith',
    password: await bcrypt.hash('password', Number(process.env.SALT_ROUNDS))
  });
};

export const setUpTestDatabase = async () => {
  dotenv.config();
  await mongoose.connect('mongodb://localhost/test', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  await insertTestData();
};

const setUpTestClient = () => {
  const server = createTestServer();
  const { query, mutate } = createTestClient(server);
  return [query, mutate];
};

export const setUp = async () => {
  await setUpTestDatabase();
  return setUpTestClient();
};

export const resetTestData = async () => {
  await Promise.all(Object.keys(models).map(key => models[key].deleteMany({})));
  await insertTestData();
};

export const tearDown = async () => {
  await Promise.all(Object.keys(models).map(key => models[key].deleteMany({})));
  await mongoose.connection.close();
};
