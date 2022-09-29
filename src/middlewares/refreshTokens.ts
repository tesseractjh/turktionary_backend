import { createAccessToken, createRefreshToken } from '@services/auth';
import { updateUserByUserId } from '@services/user';
import handleError, { CustomError } from './handleError';

const refreshTokens: HandlerWithCallback =
  (callback) => async (req, res, next) => {
    try {
      const {
        refreshToken: { userId }
      } = req;
      const newAccessToken = createAccessToken(userId as number);
      const newRefreshToken = createRefreshToken(userId as number);
      await updateUserByUserId(userId as number, {
        refresh_token: newRefreshToken
      });
      res.clearCookie('auth');
      res.cookie('auth', newRefreshToken, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        signed: true
      });
      req.accessToken = { status: 'VALID', token: newAccessToken, userId };
      if (callback) {
        callback(req, res);
      } else {
        next();
      }
    } catch {
      handleError(
        new CustomError('009', '토큰 발급 과정에서 에러 발생'),
        req,
        res,
        next
      );
    }
  };

export default refreshTokens;
