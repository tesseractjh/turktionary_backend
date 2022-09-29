import { RequestHandler } from 'express';
import handleError, { CustomError } from '@middlewares/handleError';
import verifyAccessToken from '@middlewares/verifyAccessToken';
import verifyRefreshToken from '@middlewares/verifyRefreshToken';
import refreshTokens from './refreshTokens';

const handleRefreshToken: RequestHandler = async (req, res, next) => {
  try {
    const { refreshToken } = req;
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
      res.json({ refreshAccessToken: true });
    }
  } catch (error) {
    handleError(error, req, res, next);
  }
};

const handleAccessToken: RequestHandler = async (req, res, next) => {
  const { accessToken } = req;
  if (accessToken.status === 'VALID') {
    next();
  } else {
    handleRefreshToken(req, res, next);
  }
};

const tokenHandlers = [
  verifyAccessToken,
  verifyRefreshToken,
  handleAccessToken
];

export default tokenHandlers;
