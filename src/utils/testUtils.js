import dotenv from 'dotenv';
import mongoose from 'mongoose';
import models from '../models';

export const setUp = async () => {
  dotenv.config();
  await mongoose.connect('mongodb://localhost/test', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
};

export const tearDown = async () => {
  await Promise.all(Object.keys(models).map(key => models[key].deleteMany({})));
  await mongoose.connection.close();
};
