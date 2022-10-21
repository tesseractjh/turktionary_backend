import DB from '@config/database';

export const findTotalVocaCount = async () => {
  const count = await DB.query<[{ count: number }]>(`
    SELECT lang_name, COUNT(*) AS \`count\`
    FROM voca
    GROUP BY lang_name;
  `);
  return count;
};

export const findVoca = async (
  langName: string,
  headword: string,
  vocaOrder: string
) => {
  const voca = await DB.query<Model.Voca[]>(`
    SELECT *
    FROM voca V
    WHERE
      lang_name = '${langName}'
      AND headword = '${headword}'
      AND (
        voca_order = '${vocaOrder}' OR
        voca_order = '${Number(vocaOrder) + 1}'
      );
  `);
  return voca;
};

export const findVocaMeanings = async (vocaId: number) => {
  const meanings = await DB.query<Model.MeaningList[]>(`
    SELECT
      pos_name,
      JSON_ARRAYAGG(meanings) AS meanings
    FROM (
      SELECT
      voca_id,
      pos_id,
        JSON_OBJECT(
          'meaning_id', M.meaning_id,
          'meaning_text', meaning_text,
          'examples', IF (example_id IS NULL, NULL, JSON_ARRAYAGG(
            JSON_OBJECT (
              'example_text', example_text,
              'example_translation', example_translation
            )
          ))
        ) AS meanings
      FROM meaning M
      LEFT JOIN (
        SELECT *
        FROM example
        ORDER BY example_id
        LIMIT 18446744073709551615
      ) E
      ON M.meaning_id = E.meaning_id
      WHERE voca_id = '${vocaId}'
      GROUP BY M.meaning_id
      ORDER BY example_order
    ) M
    LEFT JOIN pos P
    ON P.pos_id = M.pos_id
    GROUP BY P.pos_id
  `);
  return meanings;
};

export const findVocaCognates = async (vocaId: number) => {
  const cognates = await DB.query<{ cognates: Model.Voca[] }[]>(`
    SELECT
      IF (voca1_id IS NULL OR voca2_id IS NULL, NULL, JSON_ARRAYAGG(
			  JSON_OBJECT(
				  'voca_id', IF (voca1_id = V.voca_id, voca2_id, voca1_id),
          'lang_name', IF (voca1_id = V.voca_id, voca2_lang_name, voca1_lang_name),
          'headword', IF (voca1_id = V.voca_id, voca2_headword, voca1_headword),
          'voca_order', IF (voca1_id = V.voca_id, voca2_voca_order, voca1_voca_order)
        )
		  )) AS cognates
    FROM voca V
    LEFT JOIN (
		  SELECT
		  	C.*,
        V1.lang_name AS voca1_lang_name,
        V1.headword AS voca1_headword,
        V1.voca_order AS voca1_voca_order,
        V2.lang_name AS voca2_lang_name,
        V2.headword AS voca2_headword,
        V2.voca_order AS voca2_voca_order
      FROM cognate C
      JOIN voca V1
      ON C.voca1_id = V1.voca_id
      JOIN voca V2
      ON C.voca2_id = V2.voca_id
    ) C
    ON V.voca_id = C.voca1_id OR V.voca_id = C.voca2_id
    WHERE V.voca_id = '${vocaId}'
    GROUP BY V.voca_id
  `);
  return cognates;
};

export const findVocaSynonyms = async (vocaId: number) => {
  const synonyms = await DB.query<{ synonyms: Model.Voca[] }[]>(`
    SELECT
      IF (voca1_id IS NULL OR voca2_id IS NULL, NULL, JSON_ARRAYAGG(
			  JSON_OBJECT(
				  'voca_id', IF (voca1_id = V.voca_id, voca2_id, voca1_id),
          'headword', IF (voca1_id = V.voca_id, voca2_headword, voca1_headword),
          'voca_order', IF (voca1_id = V.voca_id, voca2_voca_order, voca1_voca_order)
        )
		  )) AS synonyms
    FROM voca V
    LEFT JOIN (
		  SELECT
		  	S.*,
        V1.headword AS voca1_headword,
        V1.voca_order AS voca1_voca_order,
        V2.headword AS voca2_headword,
        V2.voca_order AS voca2_voca_order
      FROM synonym S
      JOIN voca V1
      ON S.voca1_id = V1.voca_id
      JOIN voca V2
      ON S.voca2_id = V2.voca_id
    ) S
    ON V.voca_id = S.voca1_id OR V.voca_id = S.voca2_id
    WHERE V.voca_id = '${vocaId}'
    GROUP BY V.voca_id
  `);
  return synonyms;
};

export const findVocaAntonyms = async (vocaId: number) => {
  const antonyms = await DB.query<{ antonyms: Model.Voca[] }[]>(`
    SELECT
      IF (voca1_id IS NULL OR voca2_id IS NULL, NULL, JSON_ARRAYAGG(
			  JSON_OBJECT(
				  'voca_id', IF (voca1_id = V.voca_id, voca2_id, voca1_id),
          'headword', IF (voca1_id = V.voca_id, voca2_headword, voca1_headword),
          'voca_order', IF (voca1_id = V.voca_id, voca2_voca_order, voca1_voca_order)
        )
		  )) AS antonyms
    FROM voca V
    LEFT JOIN (
		  SELECT
		  	A.*,
        V1.headword AS voca1_headword,
        V1.voca_order AS voca1_voca_order,
        V2.headword AS voca2_headword,
        V2.voca_order AS voca2_voca_order
      FROM antonym A
      JOIN voca V1
      ON A.voca1_id = V1.voca_id
      JOIN voca V2
      ON A.voca2_id = V2.voca_id
    ) A
    ON V.voca_id = A.voca1_id OR V.voca_id = A.voca2_id
    WHERE V.voca_id = '${vocaId}'
    GROUP BY V.voca_id
  `);
  return antonyms;
};

export const findVocaList = async ({
  keyword,
  langName,
  excludedLangName
}: {
  keyword: string;
  langName?: string;
  excludedLangName?: string;
}) => {
  const vocaList = await DB.query<Model.Voca[]>(`
    SELECT * FROM voca
    WHERE headword LIKE '${`${keyword.replaceAll("'", "''")}%`}'
    ${langName ? `AND lang_name = '${langName}'` : ''}
    ${excludedLangName ? `AND lang_name != '${excludedLangName}'` : ''}
    ORDER BY headword
    LIMIT 10;
  `);
  return vocaList;
};

export const createVoca = async ({
  userId,
  voca,
  synonyms = [],
  antonyms = [],
  cognates = [],
  meaningList = []
}: {
  userId: number;
  voca: Model.Voca;
  synonyms?: number[];
  antonyms?: number[];
  cognates?: number[];
  meaningList?: (Model.POS & {
    meanings: (Model.Meaning & { examples: Model.Example[] })[];
  })[];
}) => {
  const { lang_name, headword, etymology } = voca;
  await DB.query(`
    INSERT INTO edit_log (user_id, created_time)
    VALUES ('${userId}', NOW());
    
    SET @last_log_id = LAST_INSERT_ID();

    SELECT @max_voca_order := MAX(voca_order)
    FROM voca
    WHERE lang_name = '${lang_name}' AND headword = '${headword}';

    INSERT INTO voca (edit_log_id, lang_name, headword, voca_order, etymology)
    SELECT 
      @last_log_id,
      '${lang_name}',
      '${headword}',
      IFNULL(@max_voca_order, 0) + 1,
      '${etymology}';

    SET @last_voca_id = LAST_INSERT_ID();

    ${
      synonyms.length
        ? `INSERT INTO synonym (edit_log_id, voca1_id, voca2_id) VALUES
        ${synonyms
          .map(
            (synonym_id) => `
          (@last_log_id, @last_voca_id, '${synonym_id}')
        `
          )
          .join(',')}
        ;`
        : ''
    }

    ${
      antonyms.length
        ? `INSERT INTO antonym (edit_log_id, voca1_id, voca2_id) VALUES
        ${antonyms
          .map(
            (antonym_id) => `
          (@last_log_id, @last_voca_id, '${antonym_id}')
        `
          )
          .join(',')}
        ;`
        : ''
    }

    ${
      cognates.length
        ? `INSERT INTO cognate (edit_log_id, voca1_id, voca2_id) VALUES
        ${cognates
          .map(
            (cognate_id) => `
          (@last_log_id, @last_voca_id, '${cognate_id}')
        `
          )
          .join(',')}
        ;`
        : ''
    }

    ${meaningList.map(({ pos_id, meanings }) =>
      meanings.length
        ? meanings
            .map(
              ({ meaning_text, examples }, meaningIndex) => `
            INSERT INTO
              meaning (edit_log_id, voca_id, pos_id, meaning_order, meaning_text)
            VALUES
              (@last_log_id, @last_voca_id, '${pos_id}', '${
                meaningIndex + 1
              }', '${meaning_text}');

            ${
              examples.length
                ? `
                  SET @last_meaning_id = LAST_INSERT_ID();
            
                  INSERT INTO
                    example (edit_log_id, meaning_id, example_order, example_text, example_translation)
                  VALUES
                  ${examples
                    .map(
                      ({ example_text, example_translation }, exampleIndex) => `
                  (@last_log_id, @last_meaning_id, '${
                    exampleIndex + 1
                  }', '${example_text}', '${example_translation}')
                  `
                    )
                    .join(',')}
                  ;
                `
                : ''
            }
            `
            )
            .join('\n')
        : ''
    )}
  `);
};
