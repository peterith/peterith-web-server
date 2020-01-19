import { authenticateUser, generateUserToken } from '../utils/authentication';
import { errorMessageEnum } from '../utils/enums';

export default {
  Query: {
    login: async (_parent, { user: { username, password } }, { db }, _info) => {
      await authenticateUser(username, password, db);
      const user = await db.User.findOne({ username });
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
    getUser: async (_parent, { username }, { user: contextUser }, _info) => {
      if (username !== contextUser) {
        throw 'You do not have the permission to access this page.';
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
      await authenticateUser(contextUser, oldPassword, db);
      const result = await db.User.findOneAndUpdate(
        { username: contextUser },
        user,
        { new: true, runValidators: true }
      );
      result.token = generateUserToken(user.username);
      return result;
    },
    deleteUser: async (_parent, { password }, { user, db }, _info) => {
      await authenticateUser(user, password, db);
      return db.User.findOneAndDelete({ username: user });
    }
  }
};
