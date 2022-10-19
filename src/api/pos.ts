import { Router } from 'express';
import {
  createPOS,
  createPOSReport,
  findPOSById,
  findPOSByLangAndName,
  findPOSHistoryDiff,
  findPOSHistorySummary,
  findPOSHistoryByCategory,
  findPOSInfoList,
  findPOSList,
  updatePOS
} from '@services/pos';
import tokenHandlers from '@middlewares/tokenHandlers';

const router = Router();

router.get('/', ...tokenHandlers, async (req, res) => {
  const {
    query: { lang, name, id }
  } = req;
  const pos = id
    ? await findPOSById(id as string)
    : await findPOSByLangAndName(lang as string, name as string);
  res.json(pos?.[0] || null);
});

router.post('/', ...tokenHandlers, async (req, res) => {
  const {
    body: { langId: langName, posName, posText },
    accessToken: { userId }
  } = req;
  await createPOS(userId as number, langName, posName, posText);
  res.json({ success: true });
});

router.patch('/', ...tokenHandlers, async (req, res) => {
  const {
    body: { posId, posName, posText },
    accessToken: { userId }
  } = req;
  await updatePOS(userId as number, posId, {
    pos_name: posName,
    pos_text: posText
  } as Model.POS);
  res.json({ success: true });
});

router.get('/list', async (req, res) => {
  const {
    query: { lang }
  } = req;
  const list = await findPOSList(lang as string);
  res.json(list);
});

router.get('/list/:lang_name', async (req, res) => {
  const {
    params: { lang_name }
  } = req;
  const list = await findPOSInfoList(lang_name);
  res.json(list);
});

router.get('/history', ...tokenHandlers, async (req, res) => {
  const {
    query: { id, pos_name, pos_text }
  } = req;
  const history =
    pos_name || pos_text
      ? await findPOSHistoryByCategory(id as string, { pos_name, pos_text })
      : await findPOSHistorySummary(id as string);
  res.json(history);
});

router.get('/history/diff', ...tokenHandlers, async (req, res) => {
  const {
    query: { id, log_id }
  } = req;
  const pos = await findPOSHistoryDiff(id as string, log_id as string);
  res.json(pos);
});

router.post('/report', ...tokenHandlers, async (req, res) => {
  const {
    body: { vocaPropertyName, reportTargetId, reportText },
    accessToken: { userId }
  } = req;
  await createPOSReport(
    userId as number,
    vocaPropertyName,
    reportTargetId,
    reportText
  );
  res.json({ success: true });
});

export default router;
