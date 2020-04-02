import { gql } from 'apollo-server-express';
import mongoose from 'mongoose';

export const calendarEventTypeDefs = gql`
  extend type Query {
    getCalendarEventsByDateRange(startDate: Date!, endDate: Date!): [CalendarEvent]!
  }
  extend type Mutation {
    addCalendarEvent(calendarEvent: CalendarEventInput!): CalendarEvent!
    deleteCalendarEvent(id: ID!): CalendarEvent!
  }

  type CalendarEvent {
    id: ID
    user: ID
    title: String
    type: CalendarEventTypeEnum
    isPublic: Boolean
    isAllDay: Boolean
    startDate: Date
    endDate: Date
    createdBy: ID
    updatedBy: ID
    createdAt: Date
    updatedAt: Date
  }

  enum CalendarEventTypeEnum {
    FITNESS
    GENERAL
  }

  input CalendarEventInput {
    title: String
    type: CalendarEventTypeEnum
    isPublic: Boolean
    isAllDay: Boolean
    startDate: Date
    endDate: Date
  }
`;

export const calendarEventResolvers = {
  Query: {
    getCalendarEventsByDateRange: (_, { userId, startDate, endDate }, { models }) => {
      return models.CalendarEvent.find({
        startDate: { $lt: endDate },
        endDate: { $gte: startDate },
        user: userId,
      });
    },
  },
  Mutation: {
    addCalendarEvent: (_, { calendarEvent }, { user, models }) => {
      return models.CalendarEvent.create({
        ...calendarEvent,
        user: user.id,
        createdBy: user.id,
        updatedBy: user.id,
      });
    },
    deleteCalendarEvent: async (_, { id }, { models }) => {
      return models.CalendarEvent.findByIdAndDelete(new mongoose.Types.ObjectId(id));
    },
  },
};
