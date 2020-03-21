import { gql } from 'apollo-server-express';
import { setUp, tearDown } from '../utils/testUtils';
import { CalendarEventTypeEnum } from '../utils/enums';

let mutate;

describe('Add Calendar Event', () => {
  const ADD_CALENDAR_EVENT = gql`
    mutation AddCalendarEvent($calendarEvent: CalendarEventInput!) {
      addCalendarEvent(calendarEvent: $calendarEvent) {
        id
        user
        title
        type
        isPublic
        isAllDay
        startDate
        endDate
        createdBy
        updatedBy
        createdAt
        updatedAt
      }
    }
  `;

  beforeAll(async () => {
    ({ mutate } = await setUp());
  });

  afterAll(async () => {
    await tearDown();
  });

  it('should return user', async () => {
    const {
      data: { addCalendarEvent },
    } = await mutate({
      mutation: ADD_CALENDAR_EVENT,
      variables: {
        calendarEvent: {
          title: 'title',
          type: CalendarEventTypeEnum.GENERAL,
          isPublic: true,
          isAllDay: false,
          startDate: '2020-01-01T00:00:00.000Z',
          endDate: '2020-01-01T00:00:00.000Z',
        },
      },
    });
    const calendarEvent = {
      id: expect.any(String),
      user: expect.any(String),
      title: 'title',
      type: CalendarEventTypeEnum.GENERAL,
      isPublic: true,
      isAllDay: false,
      startDate: expect.any(String),
      endDate: expect.any(String),
      createdBy: expect.any(String),
      updatedBy: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    };
    expect(addCalendarEvent).toMatchObject(calendarEvent);
  });
});
