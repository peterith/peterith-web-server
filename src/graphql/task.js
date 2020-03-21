import { gql } from 'apollo-server-express';

export const taskTypeDefs = gql`
  extend type Query {
    getTasks: [Task]!
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
    title: String
    list: TaskListEnum
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
    title: String
    list: TaskListEnum
    isPublic: Boolean
    order: Int
  }
`;

export const taskResolvers = {
  Query: {
    getTasks: (_, __, { contextUser, db }) => {
      return db.Task.find({
        user: contextUser.id,
      }).sort({
        order: 1,
      });
    },
  },
  Mutation: {
    addTask: (_, { task }, { contextUser, db }) => {
      return db.Task.create({
        ...task,
        user: contextUser.id,
        createdBy: contextUser.id,
        updatedBy: contextUser.id,
      });
    },
    updateTask: (_, { id, task }, { contextUser, db }) => {
      return db.Task.findByIdAndUpdate(
        id,
        {
          ...task,
          updatedBy: contextUser.id,
        },
        {
          new: true,
        },
      );
    },
    reorderTask: async (_, { id, newOrder }, { db, mongoose }) => {
      const reorderedTask = await db.Task.findById(new mongoose.Types.ObjectId(id));
      const list = await db.Task.find({
        list: reorderedTask.list,
        user: reorderedTask.user,
      }).sort({
        order: 1,
      });
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
    deleteTask: async (_, { id }, { db, mongoose }) => {
      const deletedTask = await db.Task.findByIdAndDelete(new mongoose.Types.ObjectId(id));
      const list = await db.Task.find({
        list: deletedTask.list,
        user: deletedTask.user,
      }).sort({
        order: 1,
      });
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
