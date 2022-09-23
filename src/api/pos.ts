import { Router } from 'express';
import {
  createPOS,
  createPOSReport,
  findPOSById,
  findPOSByLangAndName,
  findPOSHistoryDiff,
  findPOSHistorySummary,
  findPOSList
} from '@services/pos';
import tokenHandlers from '@middlewares/tokenHandlers';

const router = Router();

router.get('/', ...tokenHandlers, async (req, res) => {
  const {
    query: { id, lang, order },
    addon
  } = req;
  const pos = id
    ? await findPOSById(id as string)
    : await findPOSByLangAndName(lang as string, order as string);
  res.json({ ...addon, pos: pos?.[0] || null });
});

router.post('/', ...tokenHandlers, async (req, res) => {
  const {
    body: { langId: langName, posName, posText, posOrder },
    accessToken: { userId },
    addon
  } = req;
  await createPOS(userId as number, langName, posName, posText, posOrder);
  res.json({ ...addon });
});

router.get('/list/:lang_name', async (req, res) => {
  const {
    params: { lang_name }
  } = req;
  const list = await findPOSList(lang_name);
  res.json(list);
});

router.get('/history', ...tokenHandlers, async (req, res) => {
  const {
    query: { lang, order },
    addon
  } = req;
  const pos = await findPOSHistorySummary(lang as string, order as string);
  res.json({ ...addon, pos });
});

router.get('/history/diff', ...tokenHandlers, async (req, res) => {
  const {
    query: { lang, order, id },
    addon
  } = req;
  const pos = await findPOSHistoryDiff(
    lang as string,
    order as string,
    id as string
  );
  res.json({ ...addon, pos });
});

router.post('/report', ...tokenHandlers, async (req, res) => {
  const {
    body: { vocaPropertyName, reportTargetId, reportText },
    accessToken: { userId },
    addon
  } = req;
  await createPOSReport(
    userId as number,
    vocaPropertyName,
    reportTargetId,
    reportText
  );
  res.json({ ...addon });
});

export default router;
