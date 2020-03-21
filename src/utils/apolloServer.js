import jwt from 'jsonwebtoken';

const resolveUserFromRequestHeaders = async ({ authorization }, { User }) => {
  let user = null;
  try {
    if (authorization) {
      const token = authorization.split(' ')[1];
      user = await User.findOne({
        username: jwt.verify(token, process.env.SECRET_KEY).sub,
      });
    }
  } catch (error) {
    console.error(error);
  }
  return user;
};

export const createContext = async ({ headers }, db, mongoose) => ({
  contextUser: await resolveUserFromRequestHeaders(headers, db),
  db,
  mongoose,
});
