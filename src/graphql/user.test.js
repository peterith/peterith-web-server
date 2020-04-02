import { gql } from 'apollo-server-express';
import bcrypt from 'bcrypt';
import { models } from 'mongoose';
import { setUpDatabase, setUpClient, tearDown } from '../utils/testUtils';
import { RoleEnum, GraphQLErrorEnum } from '../utils/enums';

let query;
let mutate;

describe('Get User', () => {
  const GET_USER = gql`
    query GetUser($username: String!) {
      getUser(username: $username) {
        id
        fullName
        username
        email
        role
        fitbit {
          id
          sleepGoal
        }
        createdAt
        updatedAt
      }
    }
  `;

  beforeAll(async () => {
    await setUpDatabase();
  });

  beforeEach(async () => {
    await Promise.all(Object.keys(models).map((key) => models[key].deleteMany({})));
  });

  afterAll(async () => {
    await tearDown();
  });

  it('should return user if username matches context user', async () => {
    const user = await models.User.create({
      fullName: 'John Doe',
      username: 'johndoe',
      email: 'johndoe@mail.com',
      password: 'password',
      fitbit: {
        id: 'fitbitId',
        sleepGoal: 500,
      },
    });
    ({ query } = setUpClient(user));
    const {
      data: { getUser },
    } = await query({
      query: GET_USER,
      variables: { username: 'johndoe' },
    });
    const expected = {
      id: expect.any(String),
      fullName: 'John Doe',
      username: 'johndoe',
      email: 'johndoe@mail.com',
      role: RoleEnum.USER,
      fitbit: {
        id: 'fitbitId',
        sleepGoal: 500,
      },
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    };
    expect(getUser).toEqual(expected);
  });

  it('should return any user if context user is admin', async () => {
    const user = await models.User.create({
      fullName: 'John Doe',
      username: 'johndoe',
      email: 'johndoe@mail.com',
      password: 'password',
      role: RoleEnum.ADMIN,
      fitbit: {
        id: 'fitbitId',
        sleepGoal: 500,
      },
    });
    await models.User.create({
      fullName: 'Joe Bloggs',
      username: 'joebloggs',
      email: 'joebloggs@mail.com',
      password: 'password',
      fitbit: {
        id: 'fitbitId',
        sleepGoal: 500,
      },
    });
    ({ query } = setUpClient(user));
    const {
      data: { getUser },
    } = await query({
      query: GET_USER,
      variables: { username: 'joebloggs' },
    });
    const expected = {
      id: expect.any(String),
      fullName: 'Joe Bloggs',
      username: 'joebloggs',
      email: 'joebloggs@mail.com',
      role: RoleEnum.USER,
      fitbit: {
        id: 'fitbitId',
        sleepGoal: 500,
      },
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    };
    expect(getUser).toEqual(expected);
  });

  it('should return partial data if no context user', async () => {
    await models.User.create({
      fullName: 'John Doe',
      username: 'johndoe',
      email: 'johndoe@mail.com',
      password: 'password',
      role: RoleEnum.ADMIN,
      fitbit: {
        id: 'fitbitId',
        sleepGoal: 500,
      },
    });
    ({ query } = setUpClient());
    const {
      data: { getUser },
    } = await query({
      query: GET_USER,
      variables: { username: 'johndoe' },
    });
    const expected = {
      id: expect.any(String),
      fullName: 'John Doe',
      username: 'johndoe',
      email: null,
      role: null,
      fitbit: null,
      createdAt: null,
      updatedAt: null,
    };
    expect(getUser).toEqual(expected);
  });

  it('should return partial data if username does not match context user', async () => {
    const user = await models.User.create({
      username: 'johndoe',
      email: 'johndoe@mail.com',
      password: 'password',
    });
    await models.User.create({
      fullName: 'Joe Bloggs',
      username: 'joebloggs',
      email: 'joebloggs@mail.com',
      password: 'password',
      fitbit: {
        id: 'fitbitId',
        sleepGoal: 500,
      },
    });
    ({ query } = setUpClient(user));
    const {
      data: { getUser },
    } = await query({
      query: GET_USER,
      variables: { username: 'joebloggs' },
    });
    const expected = {
      id: expect.any(String),
      fullName: 'Joe Bloggs',
      username: 'joebloggs',
      email: null,
      role: null,
      fitbit: null,
      createdAt: null,
      updatedAt: null,
    };
    expect(getUser).toEqual(expected);
  });
});

describe('Get Auth User', () => {
  const GET_AUTH_USER = gql`
    query GetAuthUser {
      getAuthUser {
        id
        fullName
        username
        email
        role
        fitbit {
          id
          sleepGoal
        }
        createdAt
        updatedAt
      }
    }
  `;
  beforeAll(async () => {
    await setUpDatabase();
  });

  beforeEach(async () => {
    await Promise.all(Object.keys(models).map((key) => models[key].deleteMany({})));
  });

  afterAll(async () => {
    await tearDown();
  });

  it('should return context user', async () => {
    const user = await models.User.create({
      fullName: 'John Doe',
      username: 'johndoe',
      email: 'johndoe@mail.com',
      password: 'password',
      fitbit: {
        id: 'fitbitId',
        sleepGoal: 500,
      },
    });
    ({ query } = setUpClient(user));
    const {
      data: { getAuthUser },
    } = await query({ query: GET_AUTH_USER });
    const expected = {
      id: expect.any(String),
      fullName: 'John Doe',
      username: 'johndoe',
      email: 'johndoe@mail.com',
      role: RoleEnum.USER,
      fitbit: {
        id: 'fitbitId',
        sleepGoal: 500,
      },
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    };
    expect(getAuthUser).toEqual(expected);
  });

  it('should throw error if no context user', async () => {
    ({ query } = setUpClient());
    const { errors } = await query({ query: GET_AUTH_USER });
    expect(errors[0].extensions.code).toBe(GraphQLErrorEnum.UNAUTHENTICATED);
  });
});

describe('Update User', () => {
  const UPDATE_USER = gql`
    mutation UpdateUser($id: ID!, $user: UserInput!) {
      updateUser(id: $id, user: $user) {
        id
        fullName
        username
        email
        role
        fitbit {
          id
          sleepGoal
        }
        createdAt
        updatedAt
      }
    }
  `;

  beforeAll(async () => {
    await setUpDatabase();
  });

  beforeEach(async () => {
    await Promise.all(Object.keys(models).map((key) => models[key].deleteMany({})));
  });

  afterAll(async () => {
    await tearDown();
  });

  it('should update user', async () => {
    const user = await models.User.create({
      username: 'johndoe',
      email: 'johndoe@mail.com',
      password: 'password',
      fitbit: {
        id: 'fitbitId',
        sleepGoal: 500,
      },
    });
    ({ mutate } = setUpClient(user));
    await mutate({
      mutation: UPDATE_USER,
      variables: {
        id: user.id,
        user: {
          fullName: 'Joe Bloggs',
          username: 'joebloggs',
          email: 'joebloggs@mail.com',
        },
      },
    });
    const result = await models.User.findById(user.id);
    const expected = {
      id: expect.any(String),
      fullName: 'Joe Bloggs',
      username: 'joebloggs',
      email: 'joebloggs@mail.com',
      password: expect.stringMatching(/^\$2[ayb]\$.{56}$/),
      role: RoleEnum.USER,
      fitbit: {
        id: 'fitbitId',
        sleepGoal: 500,
      },
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    };
    expect(result).toMatchObject(expected);
  });

  it('should return user', async () => {
    const user = await models.User.create({
      username: 'johndoe',
      email: 'johndoe@mail.com',
      password: 'password',
      fitbit: {
        id: 'fitbitId',
        sleepGoal: 500,
      },
    });
    ({ mutate } = setUpClient(user));
    const {
      data: { updateUser },
    } = await mutate({
      mutation: UPDATE_USER,
      variables: {
        id: user.id,
        user: {
          fullName: 'Joe Bloggs',
          username: 'joebloggs',
          email: 'joebloggs@mail.com',
        },
      },
    });
    const expected = {
      id: expect.any(String),
      fullName: 'Joe Bloggs',
      username: 'joebloggs',
      email: 'joebloggs@mail.com',
      role: RoleEnum.USER,
      fitbit: {
        id: 'fitbitId',
        sleepGoal: 500,
      },
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    };
    expect(updateUser).toEqual(expected);
  });

  it('should update any user if context user is admin', async () => {
    const admin = await models.User.create({
      username: 'johndoe',
      email: 'johndoe@mail.com',
      password: 'password',
      role: RoleEnum.ADMIN,
      fitbit: {
        id: 'fitbitId',
        sleepGoal: 500,
      },
    });
    const user = await models.User.create({
      username: 'joebloggs',
      email: 'joebloggs@mail.com',
      password: 'password',
      fitbit: {
        id: 'fitbitId',
        sleepGoal: 500,
      },
    });
    ({ mutate } = setUpClient(admin));
    await mutate({
      mutation: UPDATE_USER,
      variables: {
        id: user.id,
        user: {
          fullName: 'Joe Bloggs',
          username: 'joe_bloggs',
          email: 'joe_bloggs@mail.com',
        },
      },
    });
    const result = await models.User.findById(user.id);
    const expected = {
      id: expect.any(String),
      fullName: 'Joe Bloggs',
      username: 'joe_bloggs',
      email: 'joe_bloggs@mail.com',
      password: expect.stringMatching(/^\$2[ayb]\$.{56}$/),
      role: RoleEnum.USER,
      fitbit: {
        id: 'fitbitId',
        sleepGoal: 500,
      },
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    };
    expect(result).toMatchObject(expected);
  });

  it('should return any user if context user is admin', async () => {
    const admin = await models.User.create({
      username: 'johndoe',
      email: 'johndoe@mail.com',
      password: 'password',
      role: RoleEnum.ADMIN,
      fitbit: {
        id: 'fitbitId',
        sleepGoal: 500,
      },
    });
    const user = await models.User.create({
      username: 'joebloggs',
      email: 'joebloggs@mail.com',
      password: 'password',
      fitbit: {
        id: 'fitbitId',
        sleepGoal: 500,
      },
    });
    ({ mutate } = setUpClient(admin));
    const {
      data: { updateUser },
    } = await mutate({
      mutation: UPDATE_USER,
      variables: {
        id: user.id,
        user: {
          fullName: 'Joe Bloggs',
          username: 'joe_bloggs',
          email: 'joe_bloggs@mail.com',
        },
      },
    });
    const expected = {
      id: expect.any(String),
      fullName: 'Joe Bloggs',
      username: 'joe_bloggs',
      email: 'joe_bloggs@mail.com',
      role: RoleEnum.USER,
      fitbit: {
        id: 'fitbitId',
        sleepGoal: 500,
      },
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    };
    expect(updateUser).toEqual(expected);
  });

  it('should hash and save new password', async () => {
    const user = await models.User.create({
      username: 'johndoe',
      email: 'johndoe@mail.com',
      password: 'password',
    });
    ({ mutate } = setUpClient(user));
    await mutate({
      mutation: UPDATE_USER,
      variables: {
        id: user.id,
        user: {
          username: 'johndoe',
          email: 'johndoe@mail.com',
          password: '12345678',
        },
      },
    });
    const updatedUser = await models.User.findById(user.id);
    expect(await bcrypt.compare('12345678', updatedUser.password)).toBe(true);
  });

  it('should not update password if no new password', async () => {
    const user = await models.User.create({
      username: 'johndoe',
      email: 'johndoe@mail.com',
      password: 'password',
    });
    ({ mutate } = setUpClient(user));
    await mutate({
      mutation: UPDATE_USER,
      variables: {
        id: user.id,
        user: {
          username: 'johndoe',
          email: 'johndoe@mail.com',
        },
      },
    });
    const updatedUser = await models.User.findById(user.id);
    expect(updatedUser.password).toBe(user.password);
  });

  it('should throw error if no context user', async () => {
    const user = await models.User.create({
      username: 'johndoe',
      email: 'johndoe@mail.com',
      password: 'password',
    });
    ({ mutate } = setUpClient());
    const { errors } = await mutate({
      mutation: UPDATE_USER,
      variables: {
        id: user.id,
        user: {
          username: 'johndoe',
          email: 'johndoe@mail.com',
        },
      },
    });
    expect(errors[0].extensions.code).toBe(GraphQLErrorEnum.UNAUTHENTICATED);
  });

  it('should throw error if username does not match context user', async () => {
    const admin = await models.User.create({
      username: 'johndoe',
      email: 'johndoe@mail.com',
      password: 'password',
      fitbit: {
        id: 'fitbitId',
        sleepGoal: 500,
      },
    });
    const user = await models.User.create({
      username: 'joebloggs',
      email: 'joebloggs@mail.com',
      password: 'password',
      fitbit: {
        id: 'fitbitId',
        sleepGoal: 500,
      },
    });
    ({ mutate } = setUpClient(admin));
    const { errors } = await mutate({
      mutation: UPDATE_USER,
      variables: {
        id: user.id,
        user: {
          fullName: 'Joe Bloggs',
          username: 'joe_bloggs',
          email: 'joe_bloggs@mail.com',
        },
      },
    });
    expect(errors[0].extensions.code).toBe(GraphQLErrorEnum.FORBIDDEN);
  });

  it('should throw error if username does not meet requirements', async () => {
    const user = await models.User.create({
      username: 'johndoe',
      email: 'johndoe@mail.com',
      password: 'password',
    });
    ({ mutate } = setUpClient(user));
    const { errors } = await mutate({
      mutation: UPDATE_USER,
      variables: {
        id: user.id,
        user: {
          username: 'john',
          email: 'johndoe@mail.com',
        },
      },
    });
    expect(errors[0].extensions.code).toBe(GraphQLErrorEnum.BAD_USER_INPUT);
  });

  it('should throw error if email is malformed', async () => {
    const user = await models.User.create({
      username: 'johndoe',
      email: 'johndoe@mail.com',
      password: 'password',
    });
    ({ mutate } = setUpClient(user));
    const { errors } = await mutate({
      mutation: UPDATE_USER,
      variables: {
        id: user.id,
        user: {
          username: 'johndoe',
          email: 'johndoemail.com',
        },
      },
    });
    expect(errors[0].extensions.code).toBe(GraphQLErrorEnum.BAD_USER_INPUT);
  });

  it('should throw error if password does not meet requirements', async () => {
    const user = await models.User.create({
      username: 'johndoe',
      email: 'johndoe@mail.com',
      password: 'password',
    });
    ({ mutate } = setUpClient(user));
    const { errors } = await mutate({
      mutation: UPDATE_USER,
      variables: {
        id: user.id,
        user: {
          username: 'johndoe',
          email: 'johndoe@mail.com',
          password: '123456',
        },
      },
    });
    expect(errors[0].extensions.code).toBe(GraphQLErrorEnum.BAD_USER_INPUT);
  });

  it('should throw error if username is already registered', async () => {
    const user = await models.User.create({
      username: 'johndoe',
      email: 'johndoe@mail.com',
      password: 'password',
    });
    await models.User.create({
      username: 'joebloggs',
      email: 'joebloggs@mail.com',
      password: 'password',
    });
    ({ mutate } = setUpClient(user));
    const { errors } = await mutate({
      mutation: UPDATE_USER,
      user: user.id,
      variables: {
        id: user.id,
        user: {
          username: 'joebloggs',
          email: 'johndoe@mail.com',
        },
      },
    });
    expect(errors[0].extensions.code).toBe(GraphQLErrorEnum.BAD_USER_INPUT);
  });

  it('should throw error if email is already registered', async () => {
    const user = await models.User.create({
      username: 'johndoe',
      email: 'johndoe@mail.com',
      password: 'password',
    });
    await models.User.create({
      username: 'joebloggs',
      email: 'joebloggs@mail.com',
      password: 'password',
    });
    ({ mutate } = setUpClient(user));
    const { errors } = await mutate({
      mutation: UPDATE_USER,
      variables: {
        id: user.id,
        user: {
          username: 'johndoe',
          email: 'joebloggs@mail.com',
        },
      },
    });
    expect(errors[0].extensions.code).toBe(GraphQLErrorEnum.BAD_USER_INPUT);
  });
});

// describe('Delete User', () => {
//   const DELETE_USER = gql`
//     mutation DeleteUser($password: String!) {
//       deleteUser(password: $password) {
//         id
//         token
//         firstName
//         lastName
//         username
//         email
//         role
//         createdAt
//         updatedAt
//       }
//     }
//   `;

//   beforeAll(async () => {
//     ({ mutate } = await setUp());
//   });

//   beforeEach(async () => {
//     await Promise.all(Object.keys(models).map((key) => models[key].deleteMany({})));
//   });

//   afterAll(async () => {
//     await tearDown();
//   });

//   it('should delete user', async () => {
//     await models.User.create({
//       firstName: 'John',
//       lastName: 'Doe',
//       username: 'johndoe',
//       email: 'johndoe@mail.com',
//       password: 'password',
//     });
//     await mutate({
//       mutation: DELETE_USER,
//       variables: {
//         password: 'password',
//       },
//     });
//     const user = await models.User.findOne({
//       username: 'johndoe',
//     });
//     expect(user).toBeNull();
//   });

//   it('should return user', async () => {
//     await models.User.create({
//       firstName: 'John',
//       lastName: 'Doe',
//       username: 'johndoe',
//       email: 'johndoe@mail.com',
//       password: 'password',
//     });
//     const {
//       data: { deleteUser },
//     } = await mutate({
//       mutation: DELETE_USER,
//       variables: {
//         password: 'password',
//       },
//     });
//     const user = {
//       id: expect.any(String),
//       token: null,
//       firstName: 'John',
//       lastName: 'Doe',
//       username: 'johndoe',
//       email: 'johndoe@mail.com',
//       role: RoleEnum.USER,
//       createdAt: expect.any(String),
//       updatedAt: expect.any(String),
//     };
//     expect(deleteUser).toMatchObject(user);
//   });

//   it('should throw error if password is incorrect', async () => {
//     const { errors } = await mutate({
//       mutation: DELETE_USER,
//       variables: {
//         password: '12345678',
//       },
//     });
//     expect(errors[0].extensions.code).toBe('UNAUTHENTICATED');
//   });
// });
