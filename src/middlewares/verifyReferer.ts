import { RequestHandler } from 'express';
import dotenv from 'dotenv';
import { CustomError } from './handleError';

dotenv.config();

const { DOMAIN } = process.env;

const verifyReferer: RequestHandler = async (req, res, next) => {
  const {
    originalUrl,
    headers: { referer }
  } = req;
  if (
    !originalUrl.startsWith('/auth') &&
    (typeof referer !== 'string' || !referer.startsWith(DOMAIN))
  ) {
    throw new CustomError('010', '잘못된 Referer');
  } else {
    next();
  }
};

export default verifyReferer;
