import mongoose from 'mongoose';

export const connectToDatabase = async () => {
  try {
    const { DB_SCHEME, DB_USER, DB_PASS, DB_HOST, DB_CLUSTER } = process.env;
    await mongoose.connect(
      `${DB_SCHEME}://${DB_USER}:${DB_PASS}@${DB_HOST}/${DB_CLUSTER}`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    );
    console.log(`Connected to MongoDB at ${DB_HOST} (${DB_CLUSTER})`);
  } catch (error) {
    console.error(error);
  }
};
