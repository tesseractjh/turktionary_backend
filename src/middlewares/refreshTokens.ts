import { createAccessToken, createRefreshToken } from '@services/auth';
import { updateUserByUserId } from '@services/user';

const refreshTokens: HandlerWithCallback =
  (callback) => async (req, res, next) => {
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
    req.addon = { ...(req.addon ?? {}), accessToken: newAccessToken };
    if (callback) {
      callback(req, res);
    } else {
      next();
    }
  };

export default refreshTokens;
