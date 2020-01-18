import { gql } from 'apollo-server-express';
import { setUp, resetTestData, tearDown } from '../utils/testUtils';
import models from '../models';
import { roleEnum } from '../utils/enums';

let mutate;

describe('Register User', () => {
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
      ({ mutate } = await setUp());
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

  it('should create and return user', async () => {
    const {
      data: { registerUser }
    } = await mutate({
      mutation: REGISTER_USER,
      variables: {
        user: {
          username: 'johndoe',
          email: 'johndoe@mail.com',
          password: 'password'
        }
      }
    });
    const user = await models.User.findOne({ username: 'johndoe' });

    expect(user.firstName).toBeUndefined();
    expect(user.lastName).toBeUndefined();
    expect(user.username).toBe('johndoe');
    expect(user.email).toBe('johndoe@mail.com');
    expect(user.role).toBe(roleEnum.USER);
    expect(user.password).toMatch(/^\$2[ayb]\$.{56}$/);

    expect(registerUser.firstName).toBeNull();
    expect(registerUser.lastName).toBeNull();
    expect(registerUser.username).toBe('johndoe');
    expect(registerUser.email).toBe('johndoe@mail.com');
    expect(registerUser.role).toBe(roleEnum.USER);
  });

  it('should throw error if username is already registered', async () => {
    const { errors } = await mutate({
      mutation: REGISTER_USER,
      variables: {
        user: {
          username: 'peterith',
          email: 'johndoe@mail.com',
          password: 'password'
        }
      }
    });
    expect(errors[0].message).toBe('Username is already registered');
  });

  it('should throw error if email is already registered', async () => {
    const { errors } = await mutate({
      mutation: REGISTER_USER,
      variables: {
        user: {
          username: 'johndoe',
          email: 'p.rithisith@hotmail.com',
          password: 'password'
        }
      }
    });
    expect(errors[0].message).toBe('Email is already registered');
  });
});

describe('Delete User', () => {
  const DELETE_USER = gql`
    mutation DeleteUser($password: String!) {
      deleteUser(password: $password) {
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
      ({ mutate } = await setUp());
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

  it('should delete and return user', async () => {
    const {
      data: { deleteUser }
    } = await mutate({
      mutation: DELETE_USER,
      variables: {
        password: 'password'
      }
    });
    const user = await models.User.findOne({ username: 'peterith' });

    expect(user).toBeNull();
    expect(deleteUser.firstName).toBe('Peerapong');
    expect(deleteUser.lastName).toBe('Rithisith');
    expect(deleteUser.username).toBe('peterith');
    expect(deleteUser.email).toBe('p.rithisith@hotmail.com');
    expect(deleteUser.role).toBe(roleEnum.USER);
  });

  it('should throw error if password is incorrect', async () => {
    const { errors } = await mutate({
      mutation: DELETE_USER,
      variables: {
        password: 'incorrectPassword'
      }
    });
    expect(errors[0].message).toBe('Failed to authenticate user');
  });
});
