const jwt = require('jsonwebtoken');

const getSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('Falta JWT_SECRET en el .env');
  }
  return process.env.JWT_SECRET;
};

const signToken = (user) =>
  jwt.sign({ sub: user.id, email: user.email }, getSecret(), {
    algorithm: 'HS256',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });

const verifyToken = (token) => jwt.verify(token, getSecret(), { algorithms: ['HS256'] });

module.exports = { signToken, verifyToken };
