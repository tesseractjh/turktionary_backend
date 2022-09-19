import DB from '@config/database';

export const findTotalVocaCount = async () => {
  const count = await DB.query<[{ count: number }]>(`
    SELECT lang_name, COUNT(*) AS \`count\`
    FROM voca
    GROUP BY lang_name;
  `);
  return count;
};
