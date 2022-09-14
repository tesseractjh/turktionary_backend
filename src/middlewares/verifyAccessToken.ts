import dotenv from 'dotenv';
import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

dotenv.config();
const { JWT_SECRET } = process.env;

const verifyAccessToken: RequestHandler = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (authorization && typeof authorization === 'string') {
      const token = jwt.verify(authorization.split(' ')[1], JWT_SECRET, {
        algorithms: ['HS256'],
        issuer: 'turktionary'
      }) as Token;
      if (token) {
        req.accessToken = { status: 'VALID', userId: token.userId };
        req.disableVerifyRefreshToken = true;
      } else {
        req.accessToken = { status: 'INVALID' };
      }
    } else {
      req.accessToken = { status: 'NO_TOKEN' };
    }
  } catch {
    req.accessToken = { status: 'INVALID' };
  }
  next();
};

export default verifyAccessToken;
