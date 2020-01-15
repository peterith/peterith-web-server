import jwt from 'jsonwebtoken';

const getUserFromRequestHeaders = ({ authorization }) => {
  try {
    const token = authorization.split(' ')[1];
    return jwt.verify(token, process.env.SECRET_KEY).sub;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const createContext = ({ headers }, db) => ({
  user: getUserFromRequestHeaders(headers),
  db
});
