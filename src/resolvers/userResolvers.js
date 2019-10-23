import models from '../models';
import bcrypt from 'bcrypt';
import { authenticateUser, generateUserToken } from '../utils/authentications';

export default {
  Query: {
    login: async (_parent, { user }, _context, _info) => {
      const { username, password } = user;
      try {
        await authenticateUser(models.User, username, password);

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
      _context,
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
    validateEmailAvailability: async (_parent, { email }, _context, _info) => {
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
    registerUser: async (_parent, { user }, _context, _info) => {
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
          message: 'User created successfully'
        };
      } catch (error) {
        return {
          success: false,
          message: error
        };
      }
    },

    updateUser: async (_parent, args, context, _info) => {
      const { oldPassword, ...user } = args.user;
      try {
        await authenticateUser(models.User, context.username, oldPassword);

        if (user.password) {
          user.password = await bcrypt.hash(
            user.password,
            Number(process.env.SALT_ROUNDS)
          );
        } else {
          delete user.password;
        }

        await models.User.findOneAndUpdate(
          { username: context.username },
          user
        );

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
    }
  }
};
