import { gql } from 'apollo-server-express';
import bcrypt from 'bcrypt';
import { setUp, tearDown } from '../utils/testUtils';
import models from '../models';
import { roleEnum, errorMessageEnum } from '../utils/enums';

let mutate;

// TODO: user, email and password validation
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
    try {
      ({ mutate } = await setUp());
    } catch (error) {
      console.error(error);
    }
  });

  beforeEach(async () => {
    await Promise.all(
      Object.keys(models).map(key => models[key].deleteMany({}))
    );
  });

  afterAll(async () => {
    try {
      await tearDown();
    } catch (error) {
      console.error(error);
    }
  });

  it('should create user', async () => {
    await mutate({
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
  });

  it('should return user', async () => {
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
    expect(registerUser.token).toMatch(
      /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/
    );
    expect(registerUser.firstName).toBeNull();
    expect(registerUser.lastName).toBeNull();
    expect(registerUser.username).toBe('johndoe');
    expect(registerUser.email).toBe('johndoe@mail.com');
    expect(registerUser.role).toBe(roleEnum.USER);
  });

  it('should throw error if username is already registered', async () => {
    await models.User.create({
      username: 'johndoe',
      email: 'johndoe@mail.com',
      password: 'password'
    });
    const { errors } = await mutate({
      mutation: REGISTER_USER,
      variables: {
        user: {
          username: 'johndoe',
          email: 'johndoe@mail.com',
          password: 'password'
        }
      }
    });
    expect(errors[0].message).toBe('Username is already registered');
  });

  it('should throw error if email is already registered', async () => {
    await models.User.create({
      username: 'johndoe',
      email: 'johndoe@mail.com',
      password: 'password'
    });
    const { errors } = await mutate({
      mutation: REGISTER_USER,
      variables: {
        user: {
          username: 'username',
          email: 'johndoe@mail.com',
          password: 'password'
        }
      }
    });
    expect(errors[0].message).toBe('Email is already registered');
  });
});

// TODO: user, email and password validation
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
    try {
      ({ mutate } = await setUp());
    } catch (error) {
      console.error(error);
    }
  });

  beforeEach(async () => {
    await Promise.all(
      Object.keys(models).map(key => models[key].deleteMany({}))
    );
  });

  afterAll(async () => {
    try {
      await tearDown();
    } catch (error) {
      console.error(error);
    }
  });

  it('should update user', async () => {
    await models.User.create({
      username: 'johndoe',
      email: 'johndoe@mail.com',
      password: 'password'
    });
    await mutate({
      mutation: UPDATE_USER,
      variables: {
        user: {
          firstName: 'John',
          lastName: 'Doe',
          username: 'johndoe',
          email: 'johndoe@mail.com'
        },
        oldPassword: 'password'
      }
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
    await models.User.create({
      username: 'johndoe',
      email: 'johndoe@mail.com',
      password: 'password'
    });
    const {
      data: { updateUser }
    } = await mutate({
      mutation: UPDATE_USER,
      variables: {
        user: {
          firstName: 'John',
          lastName: 'Doe',
          username: 'johndoe',
          email: 'johndoe@mail.com'
        },
        oldPassword: 'password'
      }
    });
    expect(updateUser.token).toMatch(
      /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/
    );
    expect(updateUser.firstName).toBe('John');
    expect(updateUser.lastName).toBe('Doe');
    expect(updateUser.username).toBe('johndoe');
    expect(updateUser.email).toBe('johndoe@mail.com');
    expect(updateUser.role).toBe(roleEnum.USER);
  });

  it('should not update password if no password is provided', async () => {
    const user = await models.User.create({
      username: 'johndoe',
      email: 'johndoe@mail.com',
      password: 'password'
    });
    await mutate({
      mutation: UPDATE_USER,
      variables: {
        user: {
          username: 'johndoe',
          email: 'johndoe@mail.com'
        },
        oldPassword: 'password'
      }
    });
    const updatedUser = await models.User.findOne({ username: 'johndoe' });
    expect(updatedUser.password).toBe(user.password);
  });

  it('should hash and save new password', async () => {
    await models.User.create({
      username: 'johndoe',
      email: 'johndoe@mail.com',
      password: 'password'
    });
    await mutate({
      mutation: UPDATE_USER,
      variables: {
        user: {
          username: 'johndoe',
          email: 'johndoe@mail.com',
          password: 'newPassword'
        },
        oldPassword: 'password'
      }
    });
    const user = await models.User.findOne({ username: 'johndoe' });
    expect(await bcrypt.compare('newPassword', user.password)).toBe(true);
  });

  it('should throw error if password is incorrect', async () => {
    await models.User.create({
      username: 'johndoe',
      email: 'johndoe@mail.com',
      password: 'password'
    });
    const { errors } = await mutate({
      mutation: UPDATE_USER,
      variables: {
        user: {
          firstName: 'John',
          lastName: 'Doe',
          username: 'johndoe',
          email: 'johndoe@mail.com'
        },
        oldPassword: 'incorrectPassword'
      }
    });
    expect(errors[0].message).toBe(errorMessageEnum.AUTH);
  });
});

describe('Delete User', () => {
  const DELETE_USER = gql`
    mutation DeleteUser($password: String!) {
      deleteUser(password: $password) {
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
    try {
      ({ mutate } = await setUp());
    } catch (error) {
      console.error(error);
    }
  });

  beforeEach(async () => {
    await Promise.all(
      Object.keys(models).map(key => models[key].deleteMany({}))
    );
  });

  afterAll(async () => {
    try {
      await tearDown();
    } catch (error) {
      console.error(error);
    }
  });

  it('should delete user', async () => {
    await models.User.create({
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'johndoe@mail.com',
      password: 'password'
    });
    await mutate({
      mutation: DELETE_USER,
      variables: {
        password: 'password'
      }
    });
    const user = await models.User.findOne({ username: 'johndoe' });
    expect(user).toBeNull();
  });

  it('should return user', async () => {
    await models.User.create({
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'johndoe@mail.com',
      password: 'password'
    });
    const {
      data: { deleteUser }
    } = await mutate({
      mutation: DELETE_USER,
      variables: {
        password: 'password'
      }
    });
    expect(deleteUser.token).toBeNull();
    expect(deleteUser.firstName).toBe('John');
    expect(deleteUser.lastName).toBe('Doe');
    expect(deleteUser.username).toBe('johndoe');
    expect(deleteUser.email).toBe('johndoe@mail.com');
    expect(deleteUser.role).toBe(roleEnum.USER);
  });

  it('should throw error if password is incorrect', async () => {
    const { errors } = await mutate({
      mutation: DELETE_USER,
      variables: {
        password: 'incorrectPassword'
      }
    });
    expect(errors[0].message).toBe(errorMessageEnum.AUTH);
  });
});
