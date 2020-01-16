import { setUp, tearDown } from './testUtils';
import models from '../models';
import { authenticateUser } from './authentications';

describe('Authentications', () => {
  beforeAll(async () => {
    try {
      await setUp();
    } catch (error) {
      console.error(error);
    }
  });

  afterAll(async () => {
    try {
      await tearDown();
    } catch (error) {
      console.error(error);
    }
  });

  it('should return true if user is authenticated', async () => {
    expect(
      await authenticateUser('peterith', 'password', models)
    ).toBeDefined();
  });

  it('should throw error if username is not found', async () => {
    await expect(
      authenticateUser('unknownUsername', 'password', models)
    ).rejects.toThrow();
  });

  it('should throw error if password is incorrect', async () => {
    await expect(
      authenticateUser('peterith', 'incorrectPassword', models)
    ).rejects.toThrow();
  });
});
