import jwt from 'jsonwebtoken';
import { setUp, tearDown } from './testUtils';
import models from '../models';
import { createContext } from './apolloServer';

describe('Apollo Server', () => {
  beforeAll(() => {
    setUp();
  });

  afterAll(() => {
    tearDown();
  });
  it('should return context', async () => {
    const token = jwt.sign({}, process.env.SECRET_KEY, {
      expiresIn: '1 day',
      issuer: 'peterith.com',
      subject: 'peterith'
    });
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

  it('should return context with no user if no autorization header is provided', () => {
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

  it('should return context with no user if token is not verified', () => {
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
