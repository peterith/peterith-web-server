import { AuthenticationError } from 'apollo-server-express';
import bcrypt from 'bcrypt';
import { ErrorMessageEnum } from './enums';

export const authenticateUser = async (
  username,
  password,
  { User },
  errorMessage = ErrorMessageEnum.UNAUTHENTICATED,
) => {
  const user = await User.findOne({
    username,
  });
  if (user && (await bcrypt.compare(password, user.password))) {
    return user;
  }
  throw new AuthenticationError(errorMessage);
};
