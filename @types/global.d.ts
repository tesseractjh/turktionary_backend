import { CookieOptions, RequestHandler } from 'express';
import { ParamsDictionary, Request, Response } from 'express-serve-static-core';
import QueryString from 'qs';

declare global {
  type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  type ErrorCode = `${Digit}${Digit}${Digit}`;
  type GoogleUserEmail = {
    value: string;
    verified: boolean;
  };
  type KakaoJSON = {
    kakao_account: {
      email: string;
    };
  };

  interface GoogleUser {
    id: string;
    provider: string;
    emails: GoogleUserEmail[];
  }

  interface KakaoUser {
    id: number;
    provider: string;
    _json: KakaoJSON;
  }

  interface Token {
    userId: number;
    iat: number;
    exp: number;
    issuer: string;
  }

  interface JoinToken {
    tempUserName: string;
    iat: number;
    exp: number;
    issuer: string;
  }

  type CookieParams = [string, string, CookieOptions];
  type HandlerWithCallback = (
    callback?: (
      req: Request<
        ParamsDictionary,
        any,
        any,
        QueryString.ParsedQs,
        Record<string, any>
      >,
      res: Response<any, Record<string, any>, number>
    ) => void
  ) => RequestHandler;
}

export {};
