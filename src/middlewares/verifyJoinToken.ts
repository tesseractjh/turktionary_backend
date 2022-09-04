import dotenv from 'dotenv';
import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { CustomError } from '@middlewares/handleError';

dotenv.config();
const { JWT_SECRET } = process.env;

const verifyJoinToken: RequestHandler = async (req, res, next) => {
  const { user_info_for_join } = req.signedCookies;

  if (!user_info_for_join) {
    throw new CustomError('003', '회원가입을 위한 임시 토큰이 존재하지 않음', {
      redirect: '/login'
    });
  }

  let tempUserName;
  jwt.verify(
    user_info_for_join,
    JWT_SECRET,
    {
      algorithms: ['HS256'],
      issuer: 'turktionary'
    },
    (error, decoded) => {
      if (error) {
        throw new CustomError(
          '004',
          '회원가입을 위한 임시 토큰이 유효하지 않음',
          { redirect: '/login' }
        );
      } else {
        tempUserName = (decoded as JoinToken).tempUserName;
      }
    }
  );

  if (!tempUserName) {
    throw new CustomError('004', '회원가입을 위한 임시 토큰이 유효하지 않음', {
      redirect: '/login'
    });
  }

  req.tempUserName = tempUserName;

  next();
};

export default verifyJoinToken;
