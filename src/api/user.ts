import { Router } from 'express';
import {
  findUserByUserName,
  findUserHeaderInfo,
  updateUserByTempUserName
} from '@services/user';
import { createAccessToken, createRefreshToken } from '@services/auth';
import { CustomError } from '@middlewares/handleError';
import verifyRefreshToken from '@middlewares/verifyRefreshToken';
import verifyJoinToken from '@middlewares/verifyJoinToken';
import refreshTokens from '@middlewares/refreshTokens';

const router = Router();

router.get('/name', async (req, res) => {
  const { user_name } = req.query;
  const user = await findUserByUserName(user_name as string);
  res.json({ hasDuplicate: Boolean(user) });
});

router.patch('/join', verifyJoinToken, async (req, res) => {
  const { tempUserName } = req;
  const { nickname, email } = req.body;

  if (!nickname || !email) {
    throw new CustomError('005', '잘못된 입력');
  }

  const user = await findUserByUserName(tempUserName);

  if (!user) {
    throw new CustomError('006', '임시 회원 정보가 존재하지 않음', {
      redirect: '/login'
    });
  }

  const { user_id } = user;

  const accessToken = createAccessToken(user_id);
  const refreshToken = createRefreshToken(user_id);

  await updateUserByTempUserName(tempUserName, nickname, email, refreshToken);

  res.clearCookie('user_info_for_join');
  res.cookie('auth', refreshToken, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    signed: true
  });
  res.json({ accessToken });
});

router.get('/email', verifyJoinToken, async (req, res) => {
  const { tempUserName } = req;

  const user = await findUserByUserName(tempUserName);

  if (!user) {
    throw new CustomError('006', '임시 회원 정보가 존재하지 않음', {
      redirect: '/login'
    });
  }

  const { email } = user;

  res.json({ email });
});

router.patch('/refresh', verifyRefreshToken, async (req, res, next) => {
  const { refreshToken } = req;
  if (refreshToken.status === 'VALID') {
    refreshTokens((req, res) => {
      const { addon } = req;
      res.json({ ...addon });
    })(req, res, next);
  } else if (refreshToken.status === 'INVALID') {
    throw new CustomError('002', 'refresh token이 유효하지 않음', {
      clearAccessToken: true,
      clearRefreshToken: true
    });
  } else {
    res.end();
  }
});

router.get('/is-logged-in', verifyRefreshToken, async (req, res, next) => {
  const { refreshToken } = req;
  if (refreshToken.status === 'VALID') {
    refreshTokens((req, res) => {
      res.json({ isLoggedIn: true });
    })(req, res, next);
  } else {
    res.json({ isLoggedIn: false });
  }
});

router.get('/info/header', verifyRefreshToken, async (req, res) => {
  const { refreshToken } = req;
  const { userId } = refreshToken;
  if (refreshToken.status === 'VALID') {
    const accessToken = createAccessToken(userId as number);
    const user = await findUserHeaderInfo(userId as number);
    res.json({ accessToken, user });
  } else {
    res.end();
  }
});

export default router;
