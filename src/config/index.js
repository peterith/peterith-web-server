import mongoose from 'mongoose';
import session from 'express-session';
import connectMongo from 'connect-mongo';
import './mongoose';
import './passport';
import '../models';

export const corsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true,
};

const MongoStore = connectMongo(session);

export const sessionOptions = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    secure: true,
    sameSite: 'none',
  },
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 14 * 24 * 60 * 60,
  }),
};
