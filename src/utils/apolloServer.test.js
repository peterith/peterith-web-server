import dotenv from 'dotenv';
import models from '../models';
import { createContext } from './apolloServer';
import { generateUserToken } from './authentication';

describe('Apollo Server', () => {
  beforeAll(() => {
    dotenv.config();
  });

  it('should return context', async () => {
    const token = generateUserToken('peterith');
    const req = {
      headers: {
        authorization: `bearer ${token}`
      }
    };
    const context = {
      user: 'peterith',
      db: models
    };
    expect(createContext(req, models)).toEqual(context);
  });

  it('should return context with no user if no authorization header is provided', () => {
    const req = {
      headers: {
        authorization: null
      }
    };
    const context = {
      user: null,
      db: models
    };
    expect(createContext(req, models)).toEqual(context);
  });

  it('should return context with no user if token is malformed', () => {
    const req = {
      headers: {
        authorization: `bearer malformedToken`
      }
    };
    const context = {
      user: null,
      db: models
    };
    expect(createContext(req, models)).toEqual(context);
  });
});
