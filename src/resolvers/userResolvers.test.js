import { gql } from 'apollo-server-express';
import bcrypt from 'bcrypt';
import { setUp, tearDown } from '../utils/testUtils';
import models from '../models';
import { roleEnum } from '../utils/enums';

let query;
let mutate;

describe('Login', () => {
  const LOGIN = gql`
    query Login($user: UserInput!) {
      login(user: $user) {
        token
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
    ({ query } = await setUp());
    await Promise.all(Object.keys(models).map((key) => models[key].deleteMany({})));
    await models.User.create({
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'johndoe@mail.com',
      password: 'password',
    });
  });

  afterAll(async () => {
    await tearDown();
  });

  it('should return user', async () => {
    const {
      data: { login },
    } = await query({ query: LOGIN, variables: { user: { username: 'johndoe', password: 'password' } } });
    expect(login.token).toMatch(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/);
    expect(login.firstName).toBe('John');
    expect(login.lastName).toBe('Doe');
    expect(login.username).toBe('johndoe');
    expect(login.email).toBe('johndoe@mail.com');
    expect(login.role).toBe(roleEnum.USER);
  });

  it('should throw error is username is incorrect', async () => {
    const { errors } = await query({
      query: LOGIN,
      variables: { user: { username: 'joebloggs', password: 'password' } },
    });
    expect(errors[0].extensions.code).toBe('UNAUTHENTICATED');
  });

  it('should throw error is password is incorrect', async () => {
    const { errors } = await query({
      query: LOGIN,
      variables: { user: { username: 'johndoe', password: '12345678' } },
    });
    expect(errors[0].extensions.code).toBe('UNAUTHENTICATED');
  });
});

describe('Get User', () => {
  const GET_USER = gql`
    query GetUser($username: String!) {
      getUser(username: $username) {
        token
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
    ({ query } = await setUp());
    await Promise.all(Object.keys(models).map((key) => models[key].deleteMany({})));
    await models.User.create({
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'johndoe@mail.com',
      password: 'password',
    });
  });

  afterAll(async () => {
    await tearDown();
  });

  it('should return user', async () => {
    const {
      data: { getUser },
    } = await query({ query: GET_USER, variables: { username: 'johndoe' } });
    expect(getUser.firstName).toBe('John');
    expect(getUser.lastName).toBe('Doe');
    expect(getUser.username).toBe('johndoe');
    expect(getUser.email).toBe('johndoe@mail.com');
    expect(getUser.role).toBe(roleEnum.USER);
  });

  it('should throw error if username does not match context user', async () => {
    const { errors } = await query({ query: GET_USER, variables: { username: 'joebloggs' } });
    expect(errors[0].extensions.code).toBe('FORBIDDEN');
  });
});

describe('Register User', () => {
  const REGISTER_USER = gql`
    mutation RegisterUser($user: UserInput!) {
      registerUser(user: $user) {
        token
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
    ({ mutate } = await setUp());
  });

  beforeEach(async () => {
    await Promise.all(Object.keys(models).map((key) => models[key].deleteMany({})));
  });

  afterAll(async () => {
    await tearDown();
  });

  it('should create user', async () => {
    await mutate({
      mutation: REGISTER_USER,
      variables: { user: { username: 'johndoe', email: 'johndoe@mail.com', password: 'password' } },
    });
    const user = await models.User.findOne({ username: 'johndoe' });
    expect(user.firstName).toBeUndefined();
    expect(user.lastName).toBeUndefined();
    expect(user.username).toBe('johndoe');
    expect(user.email).toBe('johndoe@mail.com');
    expect(user.role).toBe(roleEnum.USER);
    expect(user.password).toMatch(/^\$2[ayb]\$.{56}$/);
  });

  it('should return user', async () => {
    const {
      data: { registerUser },
    } = await mutate({
      mutation: REGISTER_USER,
      variables: { user: { username: 'johndoe', email: 'johndoe@mail.com', password: 'password' } },
    });
    expect(registerUser.token).toMatch(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/);
    expect(registerUser.firstName).toBeNull();
    expect(registerUser.lastName).toBeNull();
    expect(registerUser.username).toBe('johndoe');
    expect(registerUser.email).toBe('johndoe@mail.com');
    expect(registerUser.role).toBe(roleEnum.USER);
  });

  it('should throw error if username is invalid', async () => {
    const { errors } = await mutate({
      mutation: REGISTER_USER,
      variables: { user: { username: 'john', email: 'johndoe@mail.com', password: 'password' } },
    });
    expect(errors[0].extensions.code).toBe('BAD_USER_INPUT');
  });

  it('should throw error if email is invalid', async () => {
    const { errors } = await mutate({
      mutation: REGISTER_USER,
      variables: { user: { username: 'johndoe', email: 'johndoemail.com', password: 'password' } },
    });
    expect(errors[0].extensions.code).toBe('BAD_USER_INPUT');
  });

  it('should throw error if password is invalid', async () => {
    const { errors } = await mutate({
      mutation: REGISTER_USER,
      variables: { user: { username: 'johndoe', email: 'johndoemail.com', password: 'pass' } },
    });
    expect(errors[0].extensions.code).toBe('BAD_USER_INPUT');
  });

  it('should throw error if username is already registered', async () => {
    await models.User.create({ username: 'johndoe', email: 'johndoe@mail.com', password: 'password' });
    const { errors } = await mutate({
      mutation: REGISTER_USER,
      variables: { user: { username: 'johndoe', email: 'johndoe@mail.com', password: 'password' } },
    });
    expect(errors[0].extensions.code).toBe('BAD_USER_INPUT');
  });

  it('should throw error if email is already registered', async () => {
    await models.User.create({ username: 'johndoe', email: 'johndoe@mail.com', password: 'password' });
    const { errors } = await mutate({
      mutation: REGISTER_USER,
      variables: {
        user: { username: 'joebloggs', email: 'johndoe@mail.com', password: 'password' },
      },
    });
    expect(errors[0].extensions.code).toBe('BAD_USER_INPUT');
  });
});

describe('Update User', () => {
  const UPDATE_USER = gql`
    mutation UpdateUser($user: UserInput!, $oldPassword: String!) {
      updateUser(user: $user, oldPassword: $oldPassword) {
        token
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
    ({ mutate } = await setUp());
  });

  beforeEach(async () => {
    await Promise.all(Object.keys(models).map((key) => models[key].deleteMany({})));
    await models.User.create({ username: 'johndoe', email: 'johndoe@mail.com', password: 'password' });
  });

  afterAll(async () => {
    await tearDown();
  });

  it('should update user', async () => {
    await mutate({
      mutation: UPDATE_USER,
      variables: {
        user: { firstName: 'John', lastName: 'Doe', username: 'johndoe', email: 'johndoe@mail.com' },
        oldPassword: 'password',
      },
    });
    const user = await models.User.findOne({ username: 'johndoe' });
    expect(user.firstName).toBe('John');
    expect(user.lastName).toBe('Doe');
    expect(user.username).toBe('johndoe');
    expect(user.email).toBe('johndoe@mail.com');
    expect(user.role).toBe(roleEnum.USER);
    expect(user.password).toMatch(/^\$2[ayb]\$.{56}$/);
  });

  it('should return user', async () => {
    const {
      data: { updateUser },
    } = await mutate({
      mutation: UPDATE_USER,
      variables: {
        user: { firstName: 'John', lastName: 'Doe', username: 'johndoe', email: 'johndoe@mail.com' },
        oldPassword: 'password',
      },
    });
    expect(updateUser.token).toMatch(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/);
    expect(updateUser.firstName).toBe('John');
    expect(updateUser.lastName).toBe('Doe');
    expect(updateUser.username).toBe('johndoe');
    expect(updateUser.email).toBe('johndoe@mail.com');
    expect(updateUser.role).toBe(roleEnum.USER);
  });

  it('should not update password if no password is provided', async () => {
    const user = await models.User.findOne({ username: 'johndoe' });
    await mutate({
      mutation: UPDATE_USER,
      variables: { user: { username: 'johndoe', email: 'johndoe@mail.com' }, oldPassword: 'password' },
    });
    const updatedUser = await models.User.findOne({ username: 'johndoe' });
    expect(updatedUser.password).toBe(user.password);
  });

  it('should hash and save new password', async () => {
    await mutate({
      mutation: UPDATE_USER,
      variables: {
        user: { username: 'johndoe', email: 'johndoe@mail.com', password: '12345678' },
        oldPassword: 'password',
      },
    });
    const user = await models.User.findOne({ username: 'johndoe' });
    expect(await bcrypt.compare('12345678', user.password)).toBe(true);
  });

  it('should throw error if password is incorrect', async () => {
    const { errors } = await mutate({
      mutation: UPDATE_USER,
      variables: { user: { username: 'johndoe', email: 'johndoe@mail.com' }, oldPassword: '12345678' },
    });
    expect(errors[0].extensions.code).toBe('UNAUTHENTICATED');
  });
});

describe('Delete User', () => {
  const DELETE_USER = gql`
    mutation DeleteUser($password: String!) {
      deleteUser(password: $password) {
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
    ({ mutate } = await setUp());
  });

  beforeEach(async () => {
    await Promise.all(Object.keys(models).map((key) => models[key].deleteMany({})));
  });

  afterAll(async () => {
    await tearDown();
  });

  it('should delete user', async () => {
    await models.User.create({
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'johndoe@mail.com',
      password: 'password',
    });
    await mutate({ mutation: DELETE_USER, variables: { password: 'password' } });
    const user = await models.User.findOne({ username: 'johndoe' });
    expect(user).toBeNull();
  });

  it('should return user', async () => {
    await models.User.create({
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'johndoe@mail.com',
      password: 'password',
    });
    const {
      data: { deleteUser },
    } = await mutate({ mutation: DELETE_USER, variables: { password: 'password' } });
    expect(deleteUser.token).toBeUndefined();
    expect(deleteUser.firstName).toBe('John');
    expect(deleteUser.lastName).toBe('Doe');
    expect(deleteUser.username).toBe('johndoe');
    expect(deleteUser.email).toBe('johndoe@mail.com');
    expect(deleteUser.role).toBe(roleEnum.USER);
  });

  it('should throw error if password is incorrect', async () => {
    const { errors } = await mutate({ mutation: DELETE_USER, variables: { password: '12345678' } });
    expect(errors[0].extensions.code).toBe('UNAUTHENTICATED');
  });
});
