import { gql } from 'apollo-server-express';

export const sleepTypeDefs = gql`
  extend type Query {
    getCurrentWeekSleep(userId: ID!): [Sleep]!
  }

  type Sleep {
    id: ID
    user: ID
    date: Date
    minutesAsleep: Int
  }
`;

export const sleepResolvers = {
  Query: {
    getCurrentWeekSleep: (_, { userId }, { models }) => {
      return models.Sleep.find({
        user: userId,
        date: {
          $gte: getMonday(),
          $lt: getSunday(),
        },
      }).sort({ date: 1 });
    },
  },
};

const getMonday = () => {
  const date = new Date(new Date().setHours(0, 0, 0, 0));
  const diff = date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};

const getSunday = () => {
  const date = getMonday();
  return new Date(new Date().setDate(date.getDate() + 6));
};
