import dotenv from 'dotenv';
import models from '../models';
import { setUpTestDatabase } from './testUtils';
import { createContext } from './apolloServer';
import { generateUserToken } from './authentication';
import { RoleEnum } from './enums';

describe('Apollo Server', () => {
  beforeAll(async () => {
    dotenv.config();
    await setUpTestDatabase();
    await Promise.all(Object.keys(models).map((key) => models[key].deleteMany({})));
    await models.User.create({
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'johndoe@mail.com',
      password: 'password',
    });
  });

  it('should return context', async () => {
    const token = generateUserToken('johndoe');
    const req = { headers: { authorization: `bearer ${token}` } };
    const context = {
      contextUser: {
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'johndoe@mail.com',
        role: RoleEnum.USER,
      },
      db: models,
    };
    expect(await createContext(req, models)).toMatchObject(context);
  });

  it('should return context with no user if no authorization header is provided', async () => {
    const req = { headers: { authorization: null } };
    const context = { contextUser: null, db: models };
    expect(await createContext(req, models)).toEqual(context);
  });

  it('should return context with no user if token is malformed', async () => {
    const req = { headers: { authorization: `bearer malformedToken` } };
    const context = { contextUser: null, db: models };
    expect(await createContext(req, models)).toEqual(context);
  });
});
