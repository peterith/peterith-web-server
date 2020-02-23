import { ForbiddenError, UserInputError } from 'apollo-server-express';
import { authenticateUser, generateUserToken } from '../utils/authentication';
import { errorMessageEnum } from '../utils/enums';

export default {
  Query: {
    login: async (_, { user: { username, password } }, { db }) => {
      const user = await authenticateUser(username, password, db);
      user.token = generateUserToken(username);
      return user;
    },
    getUser: (_parent, { username }, { user: contextUser, db }) => {
      if (username !== contextUser) {
        throw new ForbiddenError(errorMessageEnum.NO_PERMISSION);
      }
      return db.User.findOne({ username });
    },
  },

  Mutation: {
    registerUser: async (_, { user }, { db }) => {
      if (!user.username.match(/^[a-zA-Z0-9]{6,20}$/)) {
        throw new UserInputError(errorMessageEnum.USERNAME_INVALID);
      }
      if (!user.email.includes('@')) {
        throw new UserInputError(errorMessageEnum.EMAIL_INVALID);
      }
      if (!user.password.match(/^.{8,}$/)) {
        throw new UserInputError(errorMessageEnum.PASSWORD_INVALID);
      }
      if (await db.User.findOne({ username: user.username })) {
        throw new UserInputError(errorMessageEnum.USERNAME_TAKEN);
      }
      if (await db.User.findOne({ email: user.email })) {
        throw new UserInputError(errorMessageEnum.EMAIL_TAKEN);
      }
      const result = await db.User.create(user);
      result.token = generateUserToken(user.username);
      return result;
    },
    updateUser: async (_, { user: { password, ...user }, oldPassword }, { user: contextUser, db }) => {
      if (!user.username.match(/^[a-zA-Z0-9]{6,20}$/)) {
        throw new UserInputError(errorMessageEnum.USERNAME_INVALID);
      }
      if (!user.email.includes('@')) {
        throw new UserInputError(errorMessageEnum.EMAIL_INVALID);
      }
      const result = await authenticateUser(contextUser, oldPassword, db);
      if ((await db.User.findOne({ username: user.username })) && user.username !== result.username) {
        throw new UserInputError(errorMessageEnum.USERNAME_TAKEN);
      }
      if ((await db.User.findOne({ email: user.email })) && user.email !== result.email) {
        throw new UserInputError(errorMessageEnum.EMAIL_TAKEN);
      }
      Object.assign(result, user);
      if (password) {
        if (!password.match(/^.{8,}$/)) {
          throw new UserInputError(errorMessageEnum.PASSWORD_INVALID);
        }
        result.password = password;
      }
      await result.save();
      result.token = generateUserToken(user.username);
      return result;
    },
    deleteUser: async (_, { password }, { user, db }) => {
      await authenticateUser(user, password, db);
      return db.User.findOneAndDelete({ username: user });
    },
  },
};
