import { AuthenticationError } from 'apollo-server-express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ErrorMessageEnum } from './enums';

export const authenticateUser = async (username, password, { User }, errorMessage = ErrorMessageEnum.AUTH_FAILED) => {
  const user = await User.findOne({
    username,
  });
  if (user && (await bcrypt.compare(password, user.password))) {
    return user;
  }
  throw new AuthenticationError(errorMessage);
};

export const generateUserToken = (username) => {
  return jwt.sign({}, process.env.SECRET_KEY, {
    expiresIn: '1 day',
    issuer: 'peterith.com',
    subject: username,
  });
};
