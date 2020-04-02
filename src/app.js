import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import mongoose, { models } from 'mongoose';
import passport from 'passport';
import session from 'express-session';
import cors from 'cors';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import { corsOptions, sessionOptions } from './config';
import { typeDefs, resolvers } from './graphql';
import { scheduleJobs } from './cron';

const app = express();
app.use(express.json());
app.use(cors(corsOptions));
app.use(session(sessionOptions));

app.use(passport.initialize());
app.use(passport.session());

app.post('/login', passport.authenticate('local'), (req, res) => {
  res.json({ username: req.user.username });
});

app.post('/logout', (req, res) => {
  req.logout();
  res.sendStatus(200);
});

app.post('/register', async (req, res) => {
  try {
    if (
      (!req.body.email.includes('@') && req.body.email.length > 254) ||
      !req.body.password.match(/^.{8,}$/)
    ) {
      res.sendStatus(422); // Unprocessable Entity
    } else if (await models.User.findOne({ email: req.body.email })) {
      res.sendStatus(409); // Conflict
    } else {
      const user = await models.User.create({
        username: uuidv4(),
        email: req.body.email,
        password: req.body.password,
      });
      req.login(user, (error) => {
        if (error) {
          res.sendStatus(500);
        } else {
          res.json({ username: req.user.username });
        }
      });
    }
  } catch (error) {
    res.sendStatus(500);
  }
});

app.get('/healthcheck', (req, res) => {
  res.json({
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

app.get(
  '/connect/fitbit',
  passport.authorize('fitbit', {
    scope: [
      'activity',
      'heartrate',
      'location',
      'nutrition',
      'profile',
      'settings',
      'sleep',
      'social',
      'weight',
    ],
  }),
);

app.get('/connect/fitbit/callback', passport.authorize('fitbit'), (req, res) => {
  res.redirect(`${process.env.CLIENT_URL}/@${req.user.username}`);
});

app.get('/connect/fitbit/revoke', async (req, res) => {
  const { status } = await fetch(`${process.env.FITBIT_API_URL}/oauth2/revoke`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${process.env.FITBIT_CLIENT_ID}:${process.env.FITBIT_CLIENT_SECRET}`,
      ).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `token=${req.user.fitbit.refreshToken}`,
  });

  switch (status) {
    case 200:
      console.log('success!');
      break;
    default:
      console.log(status);
      break;
  }
  req.user.fitbit = null;
  req.user.save();
  res.redirect(`${process.env.CLIENT_URL}/@${req.user.username}`);
});

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({
    user: req.user,
    models,
    mongoose,
  }),
});

server.applyMiddleware({ app, cors: corsOptions });

app.listen(process.env.PORT, () => {
  console.log(`Server ready at http://localhost:${process.env.PORT}${server.graphqlPath}`);
  scheduleJobs();
});
