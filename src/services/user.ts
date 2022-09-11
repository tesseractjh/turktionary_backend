import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import DB from '@config/database';

dotenv.config();
const { JWT_SECRET } = process.env;

export const findUserByOauth = async (id: string, provider: string) => {
  const user = await DB.query<Model.User[]>(`
    SELECT *
    FROM user
    WHERE auth_id = '${id}' AND auth_provider = '${provider}';
    `);
  return user?.[0] || null;
};

export const findUserByUserName = async (userName: string) => {
  const user = await DB.query<Model.User[]>(`
    SELECT *
    FROM user
    WHERE user_name = '${userName}';
  `);
  return user?.[0] || null;
};

export const findUserByUserId = async (userId: number) => {
  const user = await DB.query<Model.User[]>(`
    SELECT *
    FROM user
    WHERE user_id = '${userId}';
  `);
  return user?.[0] || null;
};

export const findUserHeaderInfo = async (userId: number) => {
  const user = await DB.query<Model.User[]>(`
    SELECT user_name, user_exp
    FROM user
    WHERE user_id = '${userId}';
  `);
  return user?.[0] || null;
};

export const createUser = async (
  id: string,
  provider: string,
  email?: string
) => {
  let tempUserName;
  for (let i = 0; i < 10; i++) {
    tempUserName = nanoid(20);
    const user = await findUserByUserName(tempUserName);
    if (!user) {
      break;
    }
  }
  await DB.query(`
    INSERT INTO user(auth_id, auth_provider, user_name, email)
    VALUES ('${id}', '${provider}', '${tempUserName}', '${email}');
  `);
  return tempUserName as string;
};

export const updateUserByTempUserName = async (
  tempUserName: string,
  nickname: string,
  email: string,
  refreshToken: string
) => {
  await DB.query(`
    UPDATE user
    SET
      user_name = '${nickname}',
      email = '${email}',
      refresh_token = '${refreshToken}'
    WHERE user_name = '${tempUserName}';
  `);
};

export const updateUserByUserId = async (
  userId: number,
  column: Partial<Model.User>
) => {
  const setColumnString = Object.entries(column)
    .filter(([, value]) => value)
    .map(([key, value]) => `${key} = '${value}'`)
    .join(', ');
  await DB.query(`
    UPDATE user
    SET ${setColumnString}
    WHERE user_id = '${Number(userId)}';
  `);
};

export const createAccessToken = (userId: number) =>
  jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: '1h',
    issuer: 'turktionary',
    algorithm: 'HS256'
  });

export const createRefreshToken = (userId: number) =>
  jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: '7d',
    issuer: 'turktionary',
    algorithm: 'HS256'
  });

export const createUserInfoForJoinToken = (tempUserName: string) =>
  jwt.sign({ tempUserName }, JWT_SECRET, {
    expiresIn: '30m',
    issuer: 'turktionary',
    algorithm: 'HS256'
  });
