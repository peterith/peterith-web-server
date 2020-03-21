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
    getCalendarEventsByDateRange: (_, { startDate, endDate }, { contextUser, db }) => {
      return db.CalendarEvent.find({
        startDate: {
          $lt: endDate,
        },
        endDate: {
          $gte: startDate,
        },
        user: contextUser.id,
      });
    },
  },
  Mutation: {
    addCalendarEvent: (_, { calendarEvent }, { contextUser, db }) => {
      return db.CalendarEvent.create({
        ...calendarEvent,
        user: contextUser.id,
        createdBy: contextUser.id,
        updatedBy: contextUser.id,
      });
    },
    deleteCalendarEvent: async (_, { id }, { db }) => {
      return db.CalendarEvent.findByIdAndDelete(new mongoose.Types.ObjectId(id));
    },
  },
};
