import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { FitbitOAuth2Strategy } from 'passport-fitbit-oauth2';
import bcrypt from 'bcrypt';
import { models } from 'mongoose';

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = username.includes('@')
        ? await models.User.findOne({ email: username })
        : await models.User.findOne({ username });
      return user && (await bcrypt.compare(password, user.password))
        ? done(null, user)
        : done(null, false, 'Invalid username or password.');
    } catch (error) {
      return done(error);
    }
  }),
);

passport.use(
  new FitbitOAuth2Strategy(
    {
      clientID: process.env.FITBIT_CLIENT_ID,
      clientSecret: process.env.FITBIT_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL}/connect/fitbit/callback`,
      passReqToCallback: true,
    },
    ({ user }, accessToken, refreshToken, { id }, done) => {
      try {
        if (!user) {
          done(null, false, 'No session user.');
        } else {
          user.fitbit = {
            id,
            accessToken,
            refreshToken,
          };
          user.save();
          done(null, user);
        }
      } catch (error) {
        done(error);
      }
    },
  ),
);

passport.serializeUser(({ id }, done) => {
  done(null, id);
});

passport.deserializeUser((id, done) => {
  models.User.findById(id, (error, user) => {
    done(error, user);
  });
});
