import { RequestHandler } from 'express';
import {
  createAccessToken,
  createRefreshToken,
  updateUserByUserId
} from '@services/user';
import { CustomError } from '@middlewares/handleError';
import verifyAccessToken from '@middlewares/verifyAccessToken';
import verifyRefreshToken from '@middlewares/verifyRefreshToken';

const verifyTokens: RequestHandler = async (req, res, next) => {
  const { accessToken, refreshToken } = req;
  if (refreshToken.status === 'NO_TOKEN') {
    throw new CustomError('001', 'refresh token이 존재하지 않음', {
      clearAccessToken: true,
      clearRefreshToken: true
    });
  } else if (refreshToken.status === 'INVALID') {
    throw new CustomError('002', 'refresh token이 유효하지 않음', {
      clearAccessToken: true,
      clearRefreshToken: true
    });
  } else {
    if (accessToken.status === 'VALID') {
      next();
    } else {
      const newAccessToken = createAccessToken(refreshToken.userId as number);
      const newRefreshToken = createRefreshToken(refreshToken.userId as number);
      await updateUserByUserId(refreshToken.userId as number, {
        refresh_token: newRefreshToken
      });
      res.cookie('auth', newRefreshToken, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        signed: true
      });
      res.json({ accessToken: newAccessToken });
    }
  }
};

const tokenHandlers = [verifyAccessToken, verifyRefreshToken, verifyTokens];

export default tokenHandlers;
