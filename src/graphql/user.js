import { gql, ForbiddenError, UserInputError, AuthenticationError } from 'apollo-server-express';
import { authenticateUser } from '../utils/authentication';
import { ErrorMessageEnum, RoleEnum } from '../utils/enums';

export const userTypeDefs = gql`
  extend type Query {
    getUser(username: String!): User!
    getAuthUser: User!
  }

  extend type Mutation {
    registerUser(user: UserInput!): User!
    updateUser(id: ID!, user: UserInput!): User!
    deleteUser(password: String!): User!
  }

  type User {
    id: ID
    fullName: String
    username: String
    email: String
    role: Role
    fitbit: FitbitAccount
    createdAt: Date
    updatedAt: Date
  }

  type FitbitAccount {
    id: ID
    sleepGoal: Int
  }

  enum Role {
    ADMIN
    USER
  }

  input UserInput {
    fullName: String
    username: String
    email: String
    password: String
  }
`;

export const userResolvers = {
  Query: {
    getAuthUser: (_, __, { user }) => {
      if (!user) {
        throw new AuthenticationError(ErrorMessageEnum.UNAUTHENTICATED);
      }
      return user;
    },
    getUser: async (_, { username }, { user, models }) => {
      const result = await models.User.findOne({ username });
      if (!result) {
        throw new UserInputError(ErrorMessageEnum.NO_USER);
      }
      return !user || (user.username !== username && user.role !== RoleEnum.ADMIN)
        ? {
            id: result.id,
            fullName: result.fullName,
            username: result.username,
          }
        : result;
    },
  },

  Mutation: {
    updateUser: async (_, { id, user: { password, ...user } }, { user: contextUser, models }) => {
      if (!contextUser) {
        throw new AuthenticationError(ErrorMessageEnum.UNAUTHENTICATED);
      }
      if (!user.username.match(/^(?=.{6,36}$)[A-Za-z0-9]+(?:[._-][A-Za-z0-9]+)*$/)) {
        throw new UserInputError(ErrorMessageEnum.USERNAME_POLICY_FAILED);
      }
      if (!user.email.includes('@')) {
        throw new UserInputError(ErrorMessageEnum.EMAIL_MALFORMED);
      }
      const updatedUser = await models.User.findById(id);
      if (updatedUser.id !== contextUser.id && contextUser.role !== RoleEnum.ADMIN) {
        throw new ForbiddenError(ErrorMessageEnum.UNAUTHORIZED);
      }
      if (
        (await models.User.findOne({ username: user.username })) &&
        user.username !== updatedUser.username
      ) {
        throw new UserInputError(ErrorMessageEnum.USERNAME_DUPLICATED);
      }
      if ((await models.User.findOne({ email: user.email })) && user.email !== updatedUser.email) {
        throw new UserInputError(ErrorMessageEnum.EMAIL_DUPLICATED);
      }
      Object.assign(updatedUser, user);
      if (password) {
        if (!password.match(/^.{8,}$/)) {
          throw new UserInputError(ErrorMessageEnum.PASSWORD_POLICY_FAILED);
        }
        updatedUser.password = password;
      }
      await updatedUser.save();
      return updatedUser;
    },
    deleteUser: async (_, { password }, { user, models }) => {
      await authenticateUser(user.username, password, models);
      return models.User.findOneAndDelete({ username: user.username });
    },
  },
};
