import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import models from '../models';

export const setUp = async () => {
  dotenv.config();
  await mongoose.connect('mongodb://localhost/test', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  await models.User.create({
    firstName: 'Peerapong',
    lastName: 'Rithisith',
    email: 'p.rithisith@hotmail.com',
    username: 'peterith',
    password: await bcrypt.hash('password', Number(process.env.SALT_ROUNDS))
  });
};

export const tearDown = async () => {
  await Promise.all(Object.keys(models).map(key => models[key].deleteMany({})));
  await mongoose.connection.close();
};
