import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();
const { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE, DB_PORT } = process.env;

const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  port: Number(DB_PORT),
  multipleStatements: true
});

const DB = {
  async query<T>(sql: string): Promise<T | null> {
    try {
      const connection = await pool.getConnection();
      try {
        const [result] = await connection.query(sql);
        connection.release();
        return result as T;
      } catch (queryError) {
        console.log('QUERY_ERROR:', queryError);
        connection.release();
        return null;
      }
    } catch (databaseError) {
      console.log('DB_ERROR:', databaseError);
      return null;
    }
  }
};

export default DB;
