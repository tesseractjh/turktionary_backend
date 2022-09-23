import DB from '@config/database';

export const findPOSList = async (langName: string) => {
  const seed = Math.floor(Math.random() * 10);
  const count = await DB.query<
    (Model.POS & {
      examples: (string | null)[];
      example_orders: (number | null)[];
    })[]
  >(`
    SELECT 
      pos_id,
      P.pos_order AS pos_order,
      pos_name,
      pos_text,
      JSON_ARRAYAGG(word) AS examples,
      JSON_ARRAYAGG(word_order) AS example_orders
    FROM (
      SELECT *, RANK() OVER (PARTITION BY pos_order ORDER BY created_time DESC) AS NR
      FROM pos
      WHERE lang_name = '${langName}'
    ) P
    LEFT JOIN (
      SELECT S.*, RANK() OVER (PARTITION BY pos_order ORDER BY RAND(${seed})) as R
      FROM (
        SELECT
          pos_order,
          V.voca_id as voca_id,
          word,
          word_order,
          meaning_order
        FROM meaning M
        JOIN voca V
        ON M.voca_id = V.voca_id
        WHERE M.lang_name = '${langName}'
        ORDER BY meaning_order ASC, M.created_time DESC
        LIMIT 18446744073709551615
      ) S
      GROUP BY voca_id, word_order
    ) A
    ON P.pos_order = A.pos_order
    WHERE NR = 1 AND (R <= 5 OR R IS NULL)
    GROUP BY pos_order;
  `);
  return count;
};

export const findPOSById = async (posId: string) => {
  const pos = await DB.query<Model.POS[]>(`
    SELECT 
      U.user_exp,
      U.user_name,
      pos_name,
      pos_text,
      pos_order,
      P.created_time AS created_time
    FROM pos P
    JOIN user U
    ON P.user_id = U.user_id
    WHERE pos_id = '${posId}'
  `);
  return pos;
};

export const findPOSByLangAndName = async (
  langName: string,
  posOrder: string
) => {
  const pos = await DB.query<Model.POS[]>(`
    SELECT pos_name, pos_text
    FROM pos
    WHERE lang_name = '${langName}' AND pos_order = '${posOrder}'
    ORDER BY created_time DESC
    LIMIT 1;
  `);
  return pos;
};

export const findPOSHistorySummary = async (
  langName: string,
  posOrder: string
) => {
  const pos = await DB.query<Model.POS[]>(`
    SELECT U.user_exp, U.user_name, pos_id, P.created_time AS created_time
    FROM pos P
    JOIN user U
    ON P.user_id = U.user_id
    WHERE lang_name = '${langName}' AND pos_order = '${posOrder}'
    ORDER BY created_time DESC
    LIMIT 10;
  `);
  return pos;
};

export const findPOSHistoryDiff = async (
  langName: string,
  posOrder: string,
  posId: string
) => {
  const pos = await DB.query<Model.POS[]>(`
    SELECT pos_name, pos_text
    FROM pos P
    WHERE lang_name = '${langName}' AND pos_order = '${posOrder}' AND pos_id <= '${posId}'
    ORDER BY created_time DESC
    LIMIT 2;
  `);
  return pos;
};

export const createPOS = async (
  userId: number,
  langName: string,
  posName: string,
  posText: string,
  posOrder: number
) => {
  await DB.query(`
    INSERT INTO pos(user_id, lang_name, pos_name, pos_text, pos_order)
    ${
      posOrder
        ? `VALUES
          ('${userId}', '${langName}', '${posName}', '${posText}', '${posOrder}')
        `
        : `SELECT 
            '${userId}', 
            '${langName}',
            '${posName}',
            '${posText}',
            (MAX(pos_order) + 1)
          FROM pos
          WHERE lang_name = '${langName}'
        `
    };
  `);
};

export const createPOSReport = async (
  userId: number,
  vocaPropertyName: string,
  reportTargetId: string,
  reportText: string
) => {
  await DB.query(`
    INSERT INTO report(user_id, voca_property_name, report_target_id, report_text)
    VALUES ('${userId}', '${vocaPropertyName}', '${reportTargetId}', '${reportText}');
  `);
};
