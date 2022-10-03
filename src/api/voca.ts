import { Router } from 'express';
import tokenHandlers from '@middlewares/tokenHandlers';
import { findTotalVocaCount } from '@services/voca';

const router = Router();

router.get('/count', async (req, res) => {
  const count = await findTotalVocaCount();
  res.json(count);
});

export default router;
