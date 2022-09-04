import { RequestHandler } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const { DOMAIN } = process.env;

const verifyReferer: RequestHandler = async (req, res, next) => {
  const { referer } = req.headers;
  if (typeof referer !== 'string' || `${DOMAIN}/`) {
    next();
  } else {
    throw Error;
  }
};

export default verifyReferer;
