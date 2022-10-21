import { Router } from 'express';
import tokenHandlers from '@middlewares/tokenHandlers';
import {
  createVoca,
  findTotalVocaCount,
  findVoca,
  findVocaAntonyms,
  findVocaCognates,
  findVocaList,
  findVocaMeanings,
  findVocaSynonyms
} from '@services/voca';

const router = Router();

router.get('/', async (req, res) => {
  const {
    query: { lang, headword, order }
  } = req;
  const voca = await findVoca(lang as string, headword as string);

  if (!voca?.length || !voca[Number(order) - 1]) {
    return res.end();
  }

  const { voca_id, etymology } = voca[Number(order) - 1];
  const is_unique = voca.length === 1;
  const [meanings, synonyms, antonyms, cognates] = await Promise.all([
    findVocaMeanings(voca_id),
    (await findVocaSynonyms(voca_id))?.[0].synonyms ?? null,
    (await findVocaAntonyms(voca_id))?.[0].antonyms ?? null,
    (await findVocaCognates(voca_id))?.[0].cognates ?? null
  ]);

  res.json({
    voca_id,
    is_unique,
    meanings,
    synonyms,
    antonyms,
    cognates,
    etymology
  });
});

router.get('/count', async (req, res) => {
  const count = await findTotalVocaCount();
  res.json(count);
});

router.get('/list', async (req, res) => {
  const {
    query: { keyword, lang, excluded_lang }
  } = req;
  const vocaList = await findVocaList({
    keyword: keyword as string,
    langName: lang as string,
    excludedLangName: excluded_lang as string
  });
  res.json(vocaList);
});

router.post('/', ...tokenHandlers, async (req, res) => {
  const {
    body: { voca, synonyms, antonyms, cognates, meaningList },
    accessToken: { userId }
  } = req;

  await createVoca({
    userId: userId as number,
    voca,
    synonyms,
    antonyms,
    cognates,
    meaningList
  });
  res.json({ success: true });
});

export default router;
