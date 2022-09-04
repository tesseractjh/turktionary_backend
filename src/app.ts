import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import 'express-async-errors';
import api from '@api/index';
import '@config/passport';
import verifyReferer from '@middlewares/verifyReferer';
import handleError from '@middlewares/handleError';

const app = express();

dotenv.config();
const { JWT_SECRET, DOMAIN } = process.env;
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: DOMAIN,
    credentials: true
  })
);
app.use(express.json());
app.use(passport.initialize());
app.use(cookieParser(JWT_SECRET));
app.use(verifyReferer);
app.use(api);
app.use(handleError);

app.listen(PORT, () => console.log(`👂 listening on ${PORT}`));
