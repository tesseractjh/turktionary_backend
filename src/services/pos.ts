import DB from '@config/database';

export const findPOSInfoList = async (langName: string) => {
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
    JSON_ARRAYAGG(voca_order) AS example_orders
  FROM pos P
  LEFT JOIN (
  	SELECT
      M.pos_id,
  		headword,
      voca_order,
      RANK() OVER (PARTITION BY M.pos_id ORDER BY RAND()) AS rand_order
    FROM (
      SELECT M.*, E.user_id
      FROM meaning M
      JOIN edit_log E
      ON M.edit_log_id = E.edit_log_id
    ) M
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

export const findPOSHistorySummary = async (posId: string) => {
  const history = await DB.query<Model.POS[]>(`
    SELECT
      U.user_exp,
      U.user_name,
      pos_log_id AS log_id,
      pos_id AS category_log_id,
      L_P.created_time AS created_time
    FROM (
      SELECT L.*
      FROM pos_log L
      JOIN pos P
      ON L.pos_id = P.pos_id
      WHERE P.pos_id = '${posId}'
    ) L_P
    JOIN user U
    ON L_P.user_id = U.user_id
    ORDER BY created_time DESC
    LIMIT 10;
  `);
  return history;
};

export const findPOSHistoryByCategory = async (
  posId: string,
  categories: Record<string, any>
) => {
  const { pos_name, pos_text } = categories;

  const history = await DB.query<Model.History[]>(`
    SELECT 
    	user_exp,
      user_name,
      pos_log_id AS log_id,
      pos_id AS category_log_id,
      CASE WHEN pos_name IS NOT NULL THEN 'pos_name'
    	     WHEN pos_text IS NOT NULL THEN 'pos_text'
    	END AS log_name,
      CASE WHEN pos_name IS NULL THEN pos_text
    		   WHEN pos_text IS NULL THEN pos_name
    	END AS log,
      CASE WHEN prev_pos_name IS NULL THEN prev_pos_text
    		   WHEN prev_pos_text IS NULL THEN prev_pos_name
    	END AS prev_log,
      created_time
    FROM (
    	${
        pos_name
          ? `SELECT
    		user_exp,
        user_name,
        pos_id,
        pos_log_id,
        L_P.created_time,
        pos_name,
        prev_pos_name,
        null AS pos_text,
        null AS prev_pos_text
    	FROM (
    	  SELECT
    	  	L.*,
    	  	lead(L.pos_name, 1) over (ORDER BY created_time DESC) AS prev_pos_name
    	  FROM pos_log L
    	  JOIN pos P
    	  ON L.pos_id = P.pos_id
    	  WHERE P.pos_id = '${posId}'
      ) L_P
      JOIN user U
      ON L_P.user_id = U.user_id
      WHERE pos_name != prev_pos_name OR prev_pos_name IS NULL`
          : ''
      }
      ${pos_name && pos_text ? 'UNION ALL' : ''}
    	${
        pos_text
          ? `SELECT
    		user_exp,
        user_name,
        pos_id,
        pos_log_id,
        L_P.created_time,
        null AS pos_name,
        null AS prev_pos_name,
        pos_text,
        prev_pos_text
    	FROM (
    		SELECT
    			L.*,
    			lead(L.pos_text, 1) over (ORDER BY created_time DESC) AS prev_pos_text
    		FROM pos_log L
    		JOIN pos P
    		ON L.pos_id = P.pos_id
    		WHERE P.pos_id = '${posId}'
    	) L_P
    	JOIN user U
    	ON L_P.user_id = U.user_id
      WHERE
        !(pos_text = '' AND prev_pos_text IS NULL)
        AND (pos_text != prev_pos_text OR prev_pos_text IS NULL)`
          : ''
      }
    ) L
    ORDER BY created_time DESC
    LIMIT 10;
  `);
  return history;
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
