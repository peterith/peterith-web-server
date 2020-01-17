import { gql } from 'apollo-server-express';
import { setUp, resetTestData, tearDown } from '../utils/testUtils';

describe('Register User', () => {
  let query, mutate;
  const REGISTER_USER = gql`
    mutation RegisterUser($user: UserInput!) {
      registerUser(user: $user) {
        _id
        firstName
        lastName
        username
        email
        role
        createdAt
        updatedAt
      }
    }
  `;

  beforeAll(async () => {
    try {
      [query, mutate] = await setUp();
    } catch (error) {
      console.error(error);
    }
  });

  beforeEach(async () => {
    await resetTestData();
  });

  afterAll(async () => {
    try {
      await tearDown();
    } catch (error) {
      console.error(error);
    }
  });

  it('should return user', async () => {
    const result = await mutate({
      mutation: REGISTER_USER,
      variables: {
        user: {
          username: 'johndoe',
          email: 'johndoe@mail.com',
          password: 'password'
        }
      }
    });
    expect(result.data.registerUser.username).toContain('johndoe');
    expect(result.data.registerUser.email).toContain('johndoe@mail.com');
  });

  it('should throw error if username is already registered', async () => {
    const result = await mutate({
      mutation: REGISTER_USER,
      variables: {
        user: {
          firstName: 'John',
          lastName: 'Doe',
          username: 'peterith',
          email: 'johndoe@mail.com',
          password: 'password'
        }
      }
    });
    expect(result.errors[0].message).toBe('Username is already registered');
  });

  it('should throw error if email is already registered', async () => {
    const result = await mutate({
      mutation: REGISTER_USER,
      variables: {
        user: {
          firstName: 'John',
          lastName: 'Doe',
          username: 'johndoe',
          email: 'p.rithisith@hotmail.com',
          password: 'password'
        }
      }
    });
    expect(result.errors[0].message).toBe('Email is already registered');
  });
});
