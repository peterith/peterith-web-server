import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const authenticateUser = async (username, password, { User }) => {
  const user = await User.findOne({ username });
  if (user && (await bcrypt.compare(password, user.password))) {
    return true;
  }
  throw new Error('Failed to authenticate user');
};

export const generateUserToken = username => {
  return jwt.sign({}, process.env.SECRET_KEY, {
    expiresIn: '1 day',
    issuer: 'peterith.com',
    subject: username
  });
};
