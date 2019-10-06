import { gql } from 'apollo-server-express';
import models from '../models';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const typeDefs = gql`
  type Query {
    login(user: UserInput!): LoginResponse!
    checkUsername(username: String!): Response!
    checkEmail(email: String!): Response!
    me: UserResponse!
  }

  type Mutation {
    registerUser(user: UserInput!): Response!
    updateUser(user: UserInput!): Response!
  }

  type Response {
    success: Boolean!
    message: String!
  }

  type LoginResponse {
    success: Boolean!
    message: String!
    user: User
    token: String
  }

  type UserResponse {
    success: Boolean!
    message: String!
    user: User
  }

  type User {
    _id: ID
    firstName: String
    lastName: String
    username: String
    email: String
    password: String
    role: [Role]
    createdAt: String
    updatedAt: String
  }

  input UserInput {
    _id: ID
    firstName: String
    lastName: String
    username: String
    email: String
    password: String
    role: [Role]
  }

  enum Role {
    PETE
    ADMIN
    USER
  }
`;

export const resolvers = {
  Query: {
    login: async (_parent, args, _context, _info) => {
      try {
        const user = await models.User.findOne({
          username: args.user.username
        });

        if (!user) {
          throw 'Username is not registered';
        }

        if (await bcrypt.compare(args.user.password, user.password)) {
          const token = jwt.sign({}, process.env.SECRET_KEY, {
            expiresIn: '1 day',
            issuer: 'peterith.com',
            subject: user.username
          });

          return {
            success: true,
            message: 'Login successfully',
            user,
            token
          };
        } else {
          throw 'Incorrect password';
        }
      } catch (error) {
        return {
          success: false,
          message: error
        };
      }
    },
    checkUsername: async (_parent, args, _context, _info) => {
      try {
        const user = await models.User.findOne({
          username: args.username
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
    checkEmail: async (_parent, args, _context, _info) => {
      try {
        const user = await models.User.findOne({
          email: args.email
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
    me: async (_parent, _args, context, _info) => {
      try {
        if (!context.username) throw 'Please login';

        const user = await models.User.findOne({
          username: context.username
        });

        if (user) {
          return {
            success: true,
            message: 'Get user successfully',
            user
          };
        } else {
          throw 'Failed to get user, please log in again';
        }
      } catch (error) {
        return {
          success: false,
          message: 'Failed to get user'
        };
      }
    }
  },

  Mutation: {
    registerUser: async (_parent, args, _context, _info) => {
      try {
        const existedUsername = await models.User.findOne({
          username: args.user.username
        });
        if (existedUsername) {
          throw 'Username is already registered';
        }

        const existedEmail = await models.User.findOne({
          email: args.user.email
        });
        if (existedEmail) {
          throw 'Email is already registered';
        }

        args.user.password = await bcrypt.hash(
          args.user.password,
          Number(process.env.SALT_ROUNDS)
        );
        const user = await models.User.create(args.user);

        return {
          success: true,
          message: 'User created successfully',
          payload: user
        };
      } catch (error) {
        return {
          success: false,
          message: error
        };
      }
    },

    updateUser: async (_parent, args, _context, _info) => {
      try {
        const user = await models.User.findOneAndUpdate(
          { _id: args.user._id },
          args.user,
          {
            new: true
          }
        );

        return {
          success: true,
          message: 'User updated successfully',
          payload: user
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
