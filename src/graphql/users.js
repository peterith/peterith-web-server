import { gql } from "apollo-server-express";
import models from "../models";
import bcrypt from "bcrypt";

export const typeDefs = gql`
  type Query {
    login(user: UserInput!): UserResponse!
    checkUsername(username: String!): Response!
    checkEmail(email: String!): Response!
  }

  type Mutation {
    registerUser(user: UserInput!): UserResponse!
    updateUser(user: UserInput!): UserResponse!
  }

  type Response {
    success: Boolean!
    message: String!
  }

  type UserResponse {
    success: Boolean!
    message: String!
    payload: User
  }

  type User {
    _id: ID
    firstName: String
    lastName: String
    username: String
    email: String
    password: String
    role: Role
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
    role: Role
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
          throw "Username is not registered";
        }

        if (await bcrypt.compare(args.user.password, user.password)) {
          return {
            success: true,
            message: "Login successfully",
            payload: user
          };
        } else {
          throw "Incorrect password";
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
          throw "Username is already registered";
        }

        return {
          success: true,
          message: "Username is not registered"
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
          throw "Email is already registered";
        }

        return {
          success: true,
          message: "Email is not registered"
        };
      } catch (error) {
        return {
          success: false,
          message: error
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
          throw "Username is already registered";
        }

        const existedEmail = await models.User.findOne({
          email: args.user.email
        });
        if (existedEmail) {
          throw "Email is already registered";
        }

        args.user.password = await bcrypt.hash(
          args.user.password,
          Number(process.env.SALT_ROUNDS)
        );
        const user = await models.User.create(args.user);

        return {
          success: true,
          message: "User created successfully",
          payload: user
        };
      } catch (error) {
        console.log(error);
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
          message: "User updated successfully",
          payload: user
        };
      } catch (e) {
        console.error(e);

        return {
          success: false,
          message: "Failed to update user"
        };
      }
    }
  }
};
