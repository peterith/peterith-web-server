import { gql } from 'apollo-server-express';

export const calendarEventTypeDefs = gql`
  extend type Query {
    getCalendarEventsByDateRange(startDate: Date!, endDate: Date!): [CalendarEvent]!
  }
  extend type Mutation {
    addCalendarEvent(calendarEvent: CalendarEventInput!): CalendarEvent!
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
        startDate: { $lte: endDate },
        endDate: { $gte: startDate },
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
  },
};
