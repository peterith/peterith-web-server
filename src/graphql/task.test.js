import { gql } from 'apollo-server-express';
import { models } from 'mongoose';
import { setUpDatabase, setUpClient, tearDown } from '../utils/testUtils';
import { RoleEnum, GraphQLErrorEnum, TaskListEnum } from '../utils/enums';

let query;
let mutate;

describe('Get Tasks', () => {
  const GET_TASKS = gql`
    query GetTask($userId: ID!) {
      getTasks(userId: $userId) {
        id
        user
        list
        title
        deadline
        isPublic
        order
        createdBy
        updatedBy
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

  it('should return tasks', async () => {
    const user = await models.User.create({
      username: 'johndoe',
      email: 'johndoe@mail.com',
      password: 'password',
    });
    await models.Task.create({
      user: user.id,
      list: TaskListEnum.TO_DO,
      title: 'title',
      deadline: new Date(),
      isPublic: true,
      order: 0,
      createdBy: user.id,
      updatedBy: user.id,
    });
    ({ query } = setUpClient(user));
    const {
      data: { getTasks },
    } = await query({
      query: GET_TASKS,
      variables: { userId: user.id },
    });
    const expected = [
      {
        id: expect.any(String),
        user: user.id,
        list: TaskListEnum.TO_DO,
        title: 'title',
        deadline: expect.any(String),
        isPublic: true,
        order: 0,
        createdBy: user.id,
        updatedBy: user.id,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
    ];
    expect(getTasks).toEqual(expected);
  });

  it('should return all tasks if context user is admin', async () => {
    const admin = await models.User.create({
      username: 'johndoe',
      email: 'johndoe@mail.com',
      password: 'password',
      role: RoleEnum.ADMIN,
    });
    const user = await models.User.create({
      username: 'joebloggs',
      email: 'joebloggs@mail.com',
      password: 'password',
    });
    await models.Task.create({
      user: user.id,
      list: TaskListEnum.TO_DO,
      title: 'title 1',
      deadline: new Date(),
      isPublic: true,
      order: 0,
      createdBy: user.id,
      updatedBy: user.id,
    });
    await models.Task.create({
      user: user.id,
      list: TaskListEnum.TO_DO,
      title: 'title 2',
      deadline: new Date(),
      order: 1,
      createdBy: user.id,
      updatedBy: user.id,
    });
    ({ query } = setUpClient(admin));
    const {
      data: { getTasks },
    } = await query({
      query: GET_TASKS,
      variables: { userId: user.id },
    });
    const expected = [
      {
        id: expect.any(String),
        user: user.id,
        list: TaskListEnum.TO_DO,
        title: 'title 1',
        deadline: expect.any(String),
        isPublic: true,
        order: 0,
        createdBy: user.id,
        updatedBy: user.id,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
      {
        id: expect.any(String),
        user: user.id,
        list: TaskListEnum.TO_DO,
        title: 'title 2',
        deadline: expect.any(String),
        isPublic: false,
        order: 1,
        createdBy: user.id,
        updatedBy: user.id,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
    ];
    expect(getTasks).toEqual(expected);
  });

  it('should return public tasks if no context user', async () => {
    const user = await models.User.create({
      username: 'joebloggs',
      email: 'joebloggs@mail.com',
      password: 'password',
    });
    await models.Task.create({
      user: user.id,
      list: TaskListEnum.TO_DO,
      title: 'title 1',
      deadline: new Date(),
      isPublic: true,
      order: 0,
      createdBy: user.id,
      updatedBy: user.id,
    });
    await models.Task.create({
      user: user.id,
      list: TaskListEnum.TO_DO,
      title: 'title 2',
      deadline: new Date(),
      order: 1,
      createdBy: user.id,
      updatedBy: user.id,
    });
    ({ query } = setUpClient());
    const {
      data: { getTasks },
    } = await query({
      query: GET_TASKS,
      variables: { userId: user.id },
    });
    const expected = [
      {
        id: expect.any(String),
        user: user.id,
        list: TaskListEnum.TO_DO,
        title: 'title 1',
        deadline: expect.any(String),
        isPublic: true,
        order: 0,
        createdBy: user.id,
        updatedBy: user.id,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
    ];
    expect(getTasks).toEqual(expected);
  });

  it('should return public tasks if userId does not match context user', async () => {
    const contextUser = await models.User.create({
      username: 'johndoe',
      email: 'johndoe@mail.com',
      password: 'password',
    });
    const user = await models.User.create({
      username: 'joebloggs',
      email: 'joebloggs@mail.com',
      password: 'password',
    });
    await models.Task.create({
      user: user.id,
      list: TaskListEnum.TO_DO,
      title: 'title 1',
      deadline: new Date(),
      isPublic: true,
      order: 0,
      createdBy: user.id,
      updatedBy: user.id,
    });
    await models.Task.create({
      user: user.id,
      list: TaskListEnum.TO_DO,
      title: 'title 2',
      deadline: new Date(),
      order: 1,
      createdBy: user.id,
      updatedBy: user.id,
    });
    ({ query } = setUpClient(contextUser));
    const {
      data: { getTasks },
    } = await query({
      query: GET_TASKS,
      variables: { userId: user.id },
    });
    const expected = [
      {
        id: expect.any(String),
        user: user.id,
        list: TaskListEnum.TO_DO,
        title: 'title 1',
        deadline: expect.any(String),
        isPublic: true,
        order: 0,
        createdBy: user.id,
        updatedBy: user.id,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
    ];
    expect(getTasks).toEqual(expected);
  });

  it('should return tasks sorted by order', async () => {
    const user = await models.User.create({
      username: 'johndoe',
      email: 'johndoe@mail.com',
      password: 'password',
    });
    await models.Task.create({
      user: user.id,
      list: TaskListEnum.TO_DO,
      title: 'title 2',
      deadline: new Date(),
      isPublic: false,
      order: 1,
      createdBy: user.id,
      updatedBy: user.id,
    });
    await models.Task.create({
      user: user.id,
      list: TaskListEnum.TO_DO,
      title: 'title 1',
      deadline: new Date(),
      isPublic: true,
      order: 0,
      createdBy: user.id,
      updatedBy: user.id,
    });
    ({ query } = setUpClient(user));
    const {
      data: { getTasks },
    } = await query({
      query: GET_TASKS,
      variables: { userId: user.id },
    });
    const expected = [
      {
        id: expect.any(String),
        user: user.id,
        list: TaskListEnum.TO_DO,
        title: 'title 1',
        deadline: expect.any(String),
        isPublic: true,
        order: 0,
        createdBy: user.id,
        updatedBy: user.id,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
      {
        id: expect.any(String),
        user: user.id,
        list: TaskListEnum.TO_DO,
        title: 'title 2',
        deadline: expect.any(String),
        isPublic: false,
        order: 1,
        createdBy: user.id,
        updatedBy: user.id,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
    ];
    expect(getTasks).toEqual(expected);
  });
});
