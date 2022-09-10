import { Router } from 'express';
import { CustomError } from '@middlewares/handleError';
import authRouter from './auth';
import userRouter from './user';

const router = Router();

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use(() => {
  throw new CustomError('007', 'Forbidden');
});

export default router;
