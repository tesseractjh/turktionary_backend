import dotenv from 'dotenv';
import { Router } from 'express';
import passport from 'passport';
import {
  createRefreshToken,
  createUser,
  createUserInfoForJoinToken,
  findUserByOauth,
  updateUserByUserId
} from '@services/user';

dotenv.config();
const { DOMAIN } = process.env;

const router = Router();

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    const { id, provider, emails } = req?.user as GoogleUser;
    const user = await findUserByOauth(id, provider);

    if (user) {
      // 이미 가입된 회원 -> 로그인 성공 -> refresh 토큰 발급 (access는 verifyToken 미들웨어를 거치는 요청일 때 받게 됨)
      if (user.refresh_token) {
        const refreshToken = createRefreshToken(user.user_id);
        await updateUserByUserId(user.user_id, { refresh_token: refreshToken });
        res.clearCookie('user_info_for_join');
        res.cookie('auth', refreshToken, {
          maxAge: 7 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          signed: true
        });
        res.redirect(DOMAIN);
      } else {
        // Oauth로 가입을 시도한 적이 있으나, 닉네임과 이메일 입력 등 가입 절차를 완료하지 않은 경우 -> 임시 닉네임을 쿠키로 전달
        const token = createUserInfoForJoinToken(user.user_name);
        res.cookie('user_info_for_join', token, {
          httpOnly: true,
          signed: true
        });
        res.redirect(`${DOMAIN}/join/form`);
      }
    } else {
      // 최초 Oauth 로그인 -> DB에 임시 닉네임으로 유저 정보 생성 -> 임시 닉네임을 쿠키로 전달
      const tempUserName = await createUser(id, provider, emails?.[0]?.value);
      const token = createUserInfoForJoinToken(tempUserName);
      res.cookie('user_info_for_join', token, { httpOnly: true, signed: true });
      res.redirect(`${DOMAIN}/join/form`);
    }
  }
);

export default router;
