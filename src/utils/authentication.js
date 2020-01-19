import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { errorMessageEnum } from './enums';

export const authenticateUser = async (username, password, { User }) => {
  const user = await User.findOne({ username });
  if (user && (await bcrypt.compare(password, user.password))) {
    return true;
  }
  throw new Error(errorMessageEnum.AUTH);
};

export const generateUserToken = username =>
  jwt.sign({}, process.env.SECRET_KEY, {
    expiresIn: '1 day',
    issuer: 'peterith.com',
    subject: username
  });
