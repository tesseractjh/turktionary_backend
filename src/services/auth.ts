import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();
const { JWT_SECRET } = process.env;

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
