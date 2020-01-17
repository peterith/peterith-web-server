import bcrypt from 'bcrypt';
import { authenticateUser, generateUserToken } from '../utils/authentication';

export default {
  Query: {
    login: async (_parent, { user: { username, password } }, { db }, _info) => {
      try {
        await authenticateUser(username, password, db);
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
        const user = await db.User.findOne({
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
    validateEmailAvailability: async (_parent, { email }, { db }, _info) => {
      try {
        const user = await db.User.findOne({
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

        const user = await db.User.findOne({ username });

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
    registerUser: async (_parent, { user }, { db }, _info) => {
      if (await db.User.findOne({ username: user.username })) {
        throw new Error('Username is already registered');
      }
      if (await db.User.findOne({ email: user.email })) {
        throw new Error('Email is already registered');
      }
      return await db.User.create({
        ...user,
        password: await bcrypt.hash(
          user.password,
          Number(process.env.SALT_ROUNDS)
        )
      });
    },
    updateUser: async (_parent, args, { user: contextUser, db }, _info) => {
      const { oldPassword, ...user } = args.user;
      try {
        await authenticateUser(contextUser, oldPassword, db);

        if (user.password) {
          user.password = await bcrypt.hash(
            user.password,
            Number(process.env.SALT_ROUNDS)
          );
        } else {
          delete user.password;
        }

        await db.User.findOneAndUpdate({ username }, user);

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
        await authenticateUser(user, password, db);
        await db.User.deleteOne({ user });

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
