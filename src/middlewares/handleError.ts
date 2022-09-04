import { ErrorRequestHandler } from 'express';

export class CustomError extends Error {
  code: ErrorCode;
  options?: {
    redirect?: string;
    clearAccessToken?: boolean;
    clearRefreshToken?: boolean;
  };

  constructor(
    code: ErrorCode,
    message: string,
    options?: {
      redirect?: string;
      clearAccessToken?: boolean;
      clearRefreshToken?: boolean;
    }
  ) {
    super(message);
    this.code = code;
    this.options = options ?? {};
  }
}

const statusMap: Partial<Record<ErrorCode, number>> = {
  '000': 500,
  '001': 401,
  '002': 401,
  '003': 401,
  '004': 401,
  '005': 400,
  '006': 404
};

const handleError: ErrorRequestHandler = (error, req, res, next) => {
  console.log(error);
  if (error instanceof CustomError) {
    const { code, message, options } = error ?? {
      code: '000',
      message: '알 수 없는 오류 발생!'
    };
    const { redirect, clearAccessToken, clearRefreshToken } = options ?? {};
    if (clearRefreshToken) {
      res.clearCookie('auth');
    }
    res.status(statusMap[code] ?? 500).json({
      error: {
        code,
        message,
        redirect,
        clearAccessToken
      }
    });
  } else {
    res
      .status(500)
      .json({ error: { code: '000', message: '알 수 없는 오류 발생!' } });
  }
};

export default handleError;
