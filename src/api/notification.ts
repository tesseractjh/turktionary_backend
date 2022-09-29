import { Router } from 'express';
import tokenHandlers from '@middlewares/tokenHandlers';
import {
  deleteAllUserNotification,
  deleteUserNotification,
  findUserNotification
} from '@services/notification';

const router = Router();

router.get('/', ...tokenHandlers, async (req, res) => {
  const {
    accessToken: { userId }
  } = req;
  const notification = await findUserNotification(userId as number);
  res.json({ notification });
});

router.delete('/', ...tokenHandlers, async (req, res) => {
  const {
    accessToken: { userId },
    query: { notification_id }
  } = req;
  await deleteUserNotification(
    notification_id as unknown as number,
    userId as number
  );
  res.json({ success: true });
});

router.delete('/all', ...tokenHandlers, async (req, res) => {
  const {
    accessToken: { userId }
  } = req;
  await deleteAllUserNotification(userId as number);
  res.json({ success: true });
});

export default router;
