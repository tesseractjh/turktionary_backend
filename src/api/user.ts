import { Router } from 'express';
import {
  createAccessToken,
  createRefreshToken,
  findUserByUserName,
  findUserHeaderInfo,
  updateUserByTempUserName
} from '@services/user';
import { CustomError } from '@middlewares/handleError';
import verifyRefreshToken from '@middlewares/verifyRefreshToken';
import verifyJoinToken from '@middlewares/verifyJoinToken';

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

router.patch('/refresh', verifyRefreshToken, async (req, res) => {
  const { refreshToken } = req;
  if (refreshToken.status === 'VALID') {
    const accessToken = createAccessToken(refreshToken.userId as number);
    res.json({ accessToken });
  } else {
    res.end();
  }
});

router.get('/is-logged-in', verifyRefreshToken, async (req, res) => {
  const { refreshToken } = req;
  res.json({ isLoggedIn: refreshToken.status === 'VALID' });
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