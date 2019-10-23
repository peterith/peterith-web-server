import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const authenticateUser = (User, username, password) => {
  return new Promise(async (resolve, reject) => {
    const user = await User.findOne({
      username
    });

    if (!user) {
      reject('Username is not registered');
    }

    if (await bcrypt.compare(password, user.password)) {
      resolve();
    }

    reject('Incorrect password');
  });
};

export const generateUserToken = username => {
  return jwt.sign({}, process.env.SECRET_KEY, {
    expiresIn: '1 day',
    issuer: 'peterith.com',
    subject: username
  });
};
