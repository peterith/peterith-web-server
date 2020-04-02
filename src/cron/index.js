import fitbitJob from './fitbit';

export const scheduleJobs = () => {
  fitbitJob.start();
  console.log(`Next Fitbit job date: ${fitbitJob.nextDate()}`);
};

export const cancelJobs = () => {
  fitbitJob.stop();
  console.log('Cancelled Fitbit job');
};
