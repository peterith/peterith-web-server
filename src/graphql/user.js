import { gql, ForbiddenError, UserInputError } from 'apollo-server-express';
import { authenticateUser, generateUserToken } from '../utils/authentication';
import { ErrorMessageEnum } from '../utils/enums';

export const userTypeDefs = gql`
  extend type Query {
    login(user: UserInput!): User!
    getUser(username: String!): User!
    validateUsernameAvailability(username: String!): Boolean!
    validateEmailAvailability(email: String!): Boolean!
  }

  extend type Mutation {
    registerUser(user: UserInput!): User!
    updateUser(user: UserInput!): User!
    deleteUser(password: String!): User!
  }

  type User {
    id: ID
    token: String
    firstName: String
    lastName: String
    username: String
    email: String
    role: Role
    createdAt: Date
    updatedAt: Date
  }

  enum Role {
    ADMIN
    USER
  }

  input UserInput {
    firstName: String
    lastName: String
    username: String
    email: String
    password: String
  }
`;

export const userResolvers = {
  Query: {
    login: async (_, { user: { username, password } }, { db }) => {
      const user = await authenticateUser(username, password, db, ErrorMessageEnum.LOGIN_FAILED);
      user.token = generateUserToken(username);
      return user;
    },
    getUser: (_parent, { username }, { contextUser, db }) => {
      if (username !== contextUser.username) {
        throw new ForbiddenError(ErrorMessageEnum.NO_PERMISSION);
      }
      return db.User.findOne({ username });
    },
  },

  Mutation: {
    registerUser: async (_, { user }, { db }) => {
      if (!user.username.match(/^[a-zA-Z0-9]{6,20}$/)) {
        throw new UserInputError(ErrorMessageEnum.USERNAME_INVALID);
      }
      if (!user.email.includes('@')) {
        throw new UserInputError(ErrorMessageEnum.EMAIL_INVALID);
      }
      if (!user.password.match(/^.{8,}$/)) {
        throw new UserInputError(ErrorMessageEnum.PASSWORD_INVALID);
      }
      if (await db.User.findOne({ username: user.username })) {
        throw new UserInputError(ErrorMessageEnum.USERNAME_TAKEN);
      }
      if (await db.User.findOne({ email: user.email })) {
        throw new UserInputError(ErrorMessageEnum.EMAIL_TAKEN);
      }
      const result = await db.User.create(user);
      result.token = generateUserToken(user.username);
      return result;
    },
    updateUser: async (_, { user: { password, ...user } }, { contextUser, db }) => {
      if (!user.username.match(/^[a-zA-Z0-9]{6,20}$/)) {
        throw new UserInputError(ErrorMessageEnum.USERNAME_INVALID);
      }
      if (!user.email.includes('@')) {
        throw new UserInputError(ErrorMessageEnum.EMAIL_INVALID);
      }
      if ((await db.User.findOne({ username: user.username })) && user.username !== contextUser.username) {
        throw new UserInputError(ErrorMessageEnum.USERNAME_TAKEN);
      }
      if ((await db.User.findOne({ email: user.email })) && user.email !== contextUser.email) {
        throw new UserInputError(ErrorMessageEnum.EMAIL_TAKEN);
      }
      const result = await db.User.findOne({ username: contextUser.username });
      Object.assign(result, user);
      if (password) {
        if (!password.match(/^.{8,}$/)) {
          throw new UserInputError(ErrorMessageEnum.PASSWORD_INVALID);
        }
        result.password = password;
      }
      await result.save();
      result.token = generateUserToken(user.username);
      return result;
    },
    deleteUser: async (_, { password }, { contextUser, db }) => {
      await authenticateUser(contextUser.username, password, db);
      return db.User.findOneAndDelete({ username: contextUser.username });
    },
  },
};
