import { authenticateUser, generateUserToken } from '../utils/authentication';
import { errorMessageEnum } from '../utils/enums';

export default {
  Query: {
    login: async (_parent, { user: { username, password } }, { db }, _info) => {
      const user = await authenticateUser(username, password, db);
      user.token = generateUserToken(username);
      return user;
    },
    validateUsernameAvailability: async (
      _parent,
      { username },
      { db },
      _info
    ) => ((await db.User.findOne({ username })) ? false : true),
    validateEmailAvailability: async (_parent, { email }, { db }, _info) =>
      (await db.User.findOne({ email })) ? false : true,
    getUser: (_parent, { username }, { user: contextUser, db }, _info) => {
      if (username !== contextUser) {
        throw new Error(errorMessageEnum.NO_PERMISSION);
      }
      return db.User.findOne({ username });
    }
  },

  Mutation: {
    registerUser: async (_parent, { user }, { db }, _info) => {
      if (await db.User.findOne({ username: user.username })) {
        throw new Error(errorMessageEnum.USERNAME_TAKEN);
      }
      if (await db.User.findOne({ email: user.email })) {
        throw new Error(errorMessageEnum.EMAIL_TAKEN);
      }
      const result = await db.User.create(user);
      result.token = generateUserToken(user.username);
      return result;
    },
    updateUser: async (
      _parent,
      { user, oldPassword },
      { user: contextUser, db },
      _info
    ) => {
      const result = await authenticateUser(contextUser, oldPassword, db);
      Object.assign(result, user);
      await result.save();
      result.token = generateUserToken(user.username);
      return result;
    },
    deleteUser: async (_parent, { password }, { user, db }, _info) => {
      await authenticateUser(user, password, db);
      return db.User.findOneAndDelete({ username: user });
    }
  }
};
