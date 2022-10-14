import { Router } from 'express';
import tokenHandlers from '@middlewares/tokenHandlers';
import {
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
  const voca = await findVoca(
    lang as string,
    headword as string,
    order as string
  );

  if (!voca?.length) {
    return res.end();
  }

  const { voca_id, etymology } = voca[0];
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

export default router;
