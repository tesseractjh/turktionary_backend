import DB from '@config/database';

export const findPOSInfoList = async (langName: string) => {
  const seed = Math.floor(Math.random() * 10);
  const posList = await DB.query<
    (Model.POS & {
      examples: (string | null)[];
      example_orders: (number | null)[];
    })[]
  >(`
  SELECT 
  	P.pos_id AS pos_id,
  	pos_name,
    pos_text,
  	JSON_ARRAYAGG(headword) AS examples,
    JSON_ARRAYAGG(voca_order) AS example_orders,
    voca_order,
    M_U.user_id AS user_id
  FROM pos P
  LEFT JOIN (
  	SELECT
      M.user_id,
      M.pos_id,
  		headword,
      voca_order,
      RANK() OVER (PARTITION BY M.pos_id ORDER BY RAND(${seed})) AS rand_order
    FROM meaning M
    JOIN voca V
  	ON M.voca_id = V.voca_id
  	JOIN user U
  	ON M.user_id = U.user_id
    GROUP BY headword, voca_order
  ) M_U
  ON P.pos_id = M_U.pos_id
  WHERE P.lang_name = '${langName}' AND (rand_order <= 5 OR rand_order IS NULL)
  GROUP BY P.pos_id
  `);
  return posList;
};

export const findPOSById = async (posId: string) => {
  const pos = await DB.query<Model.POS[]>(`
    SELECT
      pos_id,
      pos_name, 
      pos_text
    FROM pos
    WHERE pos_id = '${posId}';
  `);
  return pos;
};

export const findPOSByLangAndName = async (
  langName: string,
  posName: string
) => {
  const pos = await DB.query<Model.POS[]>(`
    SELECT
      pos_id,
      pos_name, 
      pos_text
    FROM pos
    WHERE lang_name = '${langName}' AND pos_name = '${posName}'
  `);
  return pos;
};

export const findPOSHistorySummary = async (
  langName: string,
  posName: string
) => {
  const pos = await DB.query<Model.POS[]>(`
    SELECT U.user_exp, U.user_name, pos_id, pos_log_id, L_P.created_time AS created_time
    FROM (
      SELECT L.*
      FROM pos_log L
      JOIN pos P
      ON L.pos_id = P.pos_id
      WHERE P.lang_name = '${langName}' AND P.pos_name = '${posName}'
    ) L_P
    JOIN user U
    ON L_P.user_id = U.user_id
    ORDER BY created_time DESC
    LIMIT 10;
  `);
  return pos;
};

export const findPOSHistoryDiff = async (posId: string, logId: string) => {
  const pos = await DB.query<Model.POS[]>(`
    SELECT pos_name, pos_text
    FROM pos_log L
    WHERE pos_id = '${posId}' AND pos_log_id <= '${logId}'
    ORDER BY created_time DESC
    LIMIT 2;
  `);
  return pos;
};

export const createPOS = async (
  userId: number,
  langName: string,
  posName: string,
  posText: string
) => {
  await DB.query(`
    INSERT INTO pos (user_id, lang_name, pos_name, pos_text)
    VALUES ('${userId}', '${langName}', '${posName}', '${posText}');
  `);
};

export const createPOSReport = async (
  userId: number,
  vocaPropertyName: string,
  reportTargetId: string,
  reportText: string
) => {
  await DB.query(`
    INSERT INTO report (
      user_id,
      voca_property_name,
      report_target_id,
      report_text,
      created_time
    )
    VALUES ('${userId}', '${vocaPropertyName}', '${reportTargetId}', '${reportText}', NOW());
  `);
};

export const updatePOS = async (
  userId: number,
  posId: number,
  pos: Model.POS
) => {
  await DB.query(`
    UPDATE pos
    SET
      user_id = '${userId}',
      pos_name = '${pos.pos_name}',
      pos_text = '${pos.pos_text}'
    WHERE pos_id = '${posId}';
  `);
};

export const findPOSList = async (langId: string) => {
  const posList = await DB.query(`
    SELECT pos_id, pos_name
    FROM pos
    WHERE lang_name = '${langId}';
  `);
  return posList;
};
