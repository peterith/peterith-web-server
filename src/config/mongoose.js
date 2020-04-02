import mongoose from 'mongoose';

try {
  mongoose.connect(`${process.env.DB_PREFIX}://${process.env.DB_HOST}`, {
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
    dbName: process.env.DB_NAME,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });
  mongoose.connection.on('connected', () => {
    console.log(`Connected to MongoDB at ${process.env.DB_HOST} (${process.env.DB_NAME})`);
  });
  mongoose.connection.on('error', (error) => {
    console.error(error);
  });

  if (process.env.NODE_ENV !== 'production') {
    mongoose.set('debug', true);
  }
} catch (error) {
  console.error(error);
}
