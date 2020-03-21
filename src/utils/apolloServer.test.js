import mongoose from 'mongoose';
import models from '../models';
import { setUp, tearDown } from './testUtils';
import { createContext } from './apolloServer';
import { generateUserToken } from './authentication';
import { RoleEnum } from './enums';

describe('Apollo Server', () => {
  beforeAll(async () => {
    await setUp();
  });

  afterAll(async () => {
    await tearDown();
  });

  it('should return context', async () => {
    const token = generateUserToken('johndoe');
    const req = {
      headers: {
        authorization: `bearer ${token}`,
      },
    };
    const context = {
      contextUser: {
        id: expect.any(String),
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'johndoe@mail.com',
        role: RoleEnum.USER,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      },
      db: models,
      mongoose,
    };
    expect(await createContext(req, models, mongoose)).toMatchObject(context);
  });

  it('should return context with no user if no authorization header is provided', async () => {
    const req = {
      headers: {
        authorization: null,
      },
    };
    const context = {
      contextUser: null,
      db: models,
      mongoose,
    };
    expect(await createContext(req, models, mongoose)).toEqual(context);
  });

  it('should return context with no user if token is malformed', async () => {
    const req = {
      headers: {
        authorization: `bearer malformedToken`,
      },
    };
    const context = {
      contextUser: null,
      db: models,
      mongoose,
    };
    expect(await createContext(req, models, mongoose)).toEqual(context);
  });
});
