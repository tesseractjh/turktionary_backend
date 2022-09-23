import { Router } from 'express';
import { CustomError } from '@middlewares/handleError';
import authRouter from './auth';
import userRouter from './user';
import notificationRouter from './notification';
import vocaRouter from './voca';
import posRouter from './pos';

const router = Router();

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/notification', notificationRouter);
router.use('/voca', vocaRouter);
router.use('/pos', posRouter);
router.use(() => {
  throw new CustomError('007', 'Forbidden');
});

export default router;
