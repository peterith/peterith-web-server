import { CronJob } from 'cron';
import { models } from 'mongoose';
import fetch from 'node-fetch';

export default new CronJob(process.env.CRON_JOB_FITBIT, async () => {
  console.log('Starting Fitbit job');
  const users = await models.User.find({ 'fitbit.id': { $ne: null } });
  users.map(async (user) => {
    await refreshTokens(user);
    processNewFitbitSleepData(user);
    updateSleepGoal(user);
  });
});

const refreshTokens = async (user) => {
  const response = await fetch(`${process.env.FITBIT_API_URL}/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${process.env.FITBIT_CLIENT_ID}:${process.env.FITBIT_CLIENT_SECRET}`,
      ).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=refresh_token&refresh_token=${user.fitbit.refreshToken}`,
  });
  const { access_token: accessToken, refresh_token: refreshToken } = await response.json();
  Object.assign(user.fitbit, { accessToken, refreshToken });
  user.save();
};

const processNewFitbitSleepData = async (user) => {
  const yesterday = generateDateString(Date.now() - 24 * 60 * 60 * 1000);
  const today = generateDateString(Date.now());
  const data = await getFitbitSleepData(user, yesterday, today);
  updateUserSleepData(user, data, yesterday, today);
};

const generateDateString = (date) => {
  return new Date(date).toISOString().substring(0, 10);
};

const getFitbitSleepData = async ({ fitbit }, startDate, endDate) => {
  const response = await fetch(
    `${process.env.FITBIT_API_URL}/1.2/user/${fitbit.id}/sleep/date/${startDate}/${endDate}.json`,
    { headers: { Authorization: `Bearer ${fitbit.accessToken}` } },
  );
  const { sleep } = await response.json();
  return sleep;
};

const updateUserSleepData = async ({ id }, data, yesterday, today) => {
  const yesterdayAndTodaySleep = data.reduce(
    (acc, cur) => {
      const result = [...acc];
      if (cur.dateOfSleep === yesterday) {
        result[0].minutesAsleep += cur.minutesAsleep;
      } else {
        result[1].minutesAsleep += cur.minutesAsleep;
      }
      return result;
    },
    [
      {
        user: id,
        date: new Date(yesterday),
        minutesAsleep: 0,
      },
      {
        user: id,
        date: new Date(today),
        minutesAsleep: 0,
      },
    ],
  );

  await models.Sleep.updateOne(
    {
      user: id,
      date: new Date(yesterday),
    },
    yesterdayAndTodaySleep[0],
    { upsert: true },
  );
  await models.Sleep.updateOne(
    {
      user: id,
      date: new Date(today),
    },
    yesterdayAndTodaySleep[1],
    { upsert: true },
  );
};

const updateSleepGoal = async (user) => {
  const response = await fetch(`${process.env.FITBIT_API_URL}/1/user/-/sleep/goal.json`, {
    headers: { Authorization: `Bearer ${user.fitbit.accessToken}` },
  });
  const { goal } = await response.json();
  user.fitbit.sleepGoal = goal.minDuration;
  user.save();
};
