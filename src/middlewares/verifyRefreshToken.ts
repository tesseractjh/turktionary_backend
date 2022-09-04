import dotenv from 'dotenv';
import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { CustomError } from '@middlewares/handleError';
import { findUserByUserId } from '@services/user';

dotenv.config();
const { JWT_SECRET } = process.env;

const verifyRefreshToken: RequestHandler = async (req, res, next) => {
  try {
    const { auth } = req.signedCookies;
    if (auth) {
      const token = jwt.verify(auth, JWT_SECRET, {
        algorithms: ['HS256'],
        issuer: 'turktionary'
      }) as Token;
      if (token) {
        const user = await findUserByUserId(token.userId);
        if (user) {
          if (user.refresh_token === auth) {
            req.refreshToken = { status: 'VALID', userId: token.userId };
          } else {
            // DB에 있는 refresh token과 일치하지 않음
            req.refreshToken = { status: 'INVALID' };
          }
        } else {
          // DB에 이 userId에 해당하는 user가 없음
          req.refreshToken = { status: 'INVALID' };
        }
      } else {
        // jwt verify 통과 못함
        req.refreshToken = { status: 'INVALID' };
      }
    } else {
      req.refreshToken = { status: 'NO_TOKEN' };
    }
  } catch {
    req.refreshToken = { status: 'INVALID' };
  }
  next();
};

export default verifyRefreshToken;
