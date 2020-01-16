import bcrypt from 'bcrypt';
import { authenticateUser, generateUserToken } from '../utils/authentications';

export default {
  Query: {
    login: async (
      _parent,
      { user: { username, password } },
      { models },
      _info
    ) => {
      try {
        await authenticateUser(username, password, models);
        return {
          success: true,
          message: 'User login successfully',
          username,
          token: generateUserToken(username)
        };
      } catch (error) {
        return {
          success: false,
          message: error
        };
      }
    },
    validateUsernameAvailability: async (
      _parent,
      { username },
      { models },
      _info
    ) => {
      try {
        const user = await models.User.findOne({
          username
        });

        if (user) {
          throw 'Username is already registered';
        }

        return {
          success: true,
          message: 'Username is not registered'
        };
      } catch (error) {
        return {
          success: false,
          message: error
        };
      }
    },
    validateEmailAvailability: async (
      _parent,
      { email },
      { models },
      _info
    ) => {
      try {
        const user = await models.User.findOne({
          email
        });

        if (user) {
          throw 'Email is already registered';
        }

        return {
          success: true,
          message: 'Email is not registered'
        };
      } catch (error) {
        return {
          success: false,
          message: error
        };
      }
    },
    getUser: async (_parent, { username }, context, _info) => {
      try {
        if (username !== context.username) {
          throw 'You do not have the permission to access this page.';
        }

        const user = await models.User.findOne({ username });

        if (user) {
          return {
            success: true,
            message: 'User retrieve successfully',
            user
          };
        } else {
          throw 'Failed to retrieve user';
        }
      } catch (error) {
        return {
          success: false,
          message: error
        };
      }
    }
  },

  Mutation: {
    registerUser: async (_parent, { user }, { models }, _info) => {
      try {
        let existedUser = await models.User.findOne({
          username: user.username
        });

        if (existedUser) {
          throw 'Username is already registered';
        }

        existedUser = await models.User.findOne({
          email: user.email
        });

        if (existedUser) {
          throw 'Email is already registered';
        }

        user.password = await bcrypt.hash(
          user.password,
          Number(process.env.SALT_ROUNDS)
        );
        await models.User.create(user);

        return {
          success: true,
          message: 'User created successfully',
          username: user.username,
          token: generateUserToken(user.username)
        };
      } catch (error) {
        return {
          success: false,
          message: error
        };
      }
    },
    updateUser: async (_parent, args, { user: contextUser, models }, _info) => {
      const { oldPassword, ...user } = args.user;
      try {
        await authenticateUser(contextUser, oldPassword, models);

        if (user.password) {
          user.password = await bcrypt.hash(
            user.password,
            Number(process.env.SALT_ROUNDS)
          );
        } else {
          delete user.password;
        }

        await models.User.findOneAndUpdate({ username }, user);

        return {
          success: true,
          message: 'User updated successfully',
          username: user.username,
          token: generateUserToken(user.username)
        };
      } catch (error) {
        return {
          success: false,
          message: error
        };
      }
    },
    deleteUser: async (_parent, { password }, { user }, _info) => {
      try {
        await authenticateUser(user, password, models);
        await models.User.deleteOne({ user });

        return {
          success: true,
          message: 'User deleted successfully'
        };
      } catch (error) {
        return {
          success: false,
          message: error
        };
      }
    }
  }
};
