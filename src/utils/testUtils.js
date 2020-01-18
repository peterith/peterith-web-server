import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import models from '../models';
import { createTestClient } from 'apollo-server-testing';
import { createTestServer } from './apolloServer';

export const setUp = async () => {
  await setUpTestDatabase();
  return setUpTestClient();
};

export const setUpTestDatabase = async () => {
  await mongoose.connect('mongodb://localhost/test', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  await insertTestData();
};

export const resetTestData = async () => {
  await Promise.all(Object.keys(models).map(key => models[key].deleteMany({})));
  await insertTestData();
};

export const tearDown = async () => {
  await Promise.all(Object.keys(models).map(key => models[key].deleteMany({})));
  await mongoose.connection.close();
};

const setUpTestClient = () => {
  const server = createTestServer();
  return createTestClient(server);
};

const insertTestData = async () => {
  await models.User.create({
    firstName: 'Peerapong',
    lastName: 'Rithisith',
    email: 'p.rithisith@hotmail.com',
    username: 'peterith',
    password: await bcrypt.hash('password', Number(process.env.SALT_ROUNDS))
  });
};
