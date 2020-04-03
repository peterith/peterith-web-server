import { gql } from 'apollo-server-express';
import { RoleEnum } from '../utils/enums';

export const taskTypeDefs = gql`
  extend type Query {
    getTasks(userId: ID!): [Task]!
  }

  extend type Mutation {
    addTask(task: TaskInput!): Task!
    updateTask(id: ID!, task: TaskInput!): Task!
    reorderTask(id: ID!, newOrder: Int): [Task]!
    deleteTask(id: ID!): [Task]!
  }

  type Task {
    id: ID
    user: ID
    list: TaskListEnum
    title: String
    deadline: Date
    isPublic: Boolean
    order: Int
    createdBy: ID
    updatedBy: ID
    createdAt: Date
    updatedAt: Date
  }

  enum TaskListEnum {
    TO_DO
    IN_PROGRESS
    DONE
  }

  input TaskInput {
    list: TaskListEnum
    title: String
    deadline: Date
    isPublic: Boolean
    order: Int
  }
`;

export const taskResolvers = {
  Query: {
    getTasks: (_, { userId }, { user, models }) => {
      const field =
        user && (user.id === userId || user.role === RoleEnum.ADMIN) ? {} : { isPublic: true };
      return models.Task.find({ ...field, user: userId }).sort({ order: 1 });
    },
  },
  Mutation: {
    addTask: (_, { task }, { user, models }) => {
      return models.Task.create({
        ...task,
        user: user.id,
        createdBy: user.id,
        updatedBy: user.id,
      });
    },
    updateTask: (_, { id, task }, { user, models }) => {
      return models.Task.findByIdAndUpdate(id, { ...task, updatedBy: user.id }, { new: true });
    },
    reorderTask: async (_, { id, newOrder }, { models, mongoose }) => {
      const reorderedTask = await models.Task.findById(new mongoose.Types.ObjectId(id));
      const list = await models.Task.find({
        list: reorderedTask.list,
        user: reorderedTask.user,
      }).sort({ order: 1 });
      const highIndex = reorderedTask.order > newOrder ? reorderedTask.order : newOrder;
      const lowIndex = highIndex === reorderedTask.order ? newOrder : reorderedTask.order;
      const result = await Promise.all(
        list.map((task) => {
          if (task.order < lowIndex || task.order > highIndex) {
            return task;
          }
          if (task.order === reorderedTask.order) {
            task.order = newOrder;
            return task.save();
          }
          if (reorderedTask.order < newOrder) {
            task.order -= 1;
            return task.save();
          }
          task.order += 1;
          return task.save();
        }),
      );
      return result.sort((a, b) => a.order - b.order);
    },
    deleteTask: async (_, { id }, { models, mongoose }) => {
      const deletedTask = await models.Task.findByIdAndDelete(new mongoose.Types.ObjectId(id));
      const list = await models.Task.find({
        list: deletedTask.list,
        user: deletedTask.user,
      }).sort({ order: 1 });
      return Promise.all(
        list.map((task, index) => {
          if (task.order === index) {
            return task;
          }
          task.order -= 1;
          return task.save();
        }),
      );
    },
  },
};
