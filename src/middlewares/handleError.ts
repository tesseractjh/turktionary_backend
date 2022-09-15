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
  '001': 401, // refresh token 없음
  '002': 401, // refresh token 유효하지 않음
  '003': 401, // user_info_for_join token 존재하지 않음
  '004': 401, // user_info_for_join token 유효하지 않음
  '005': 400, // 회원가입 폼 입력 정보가 유효하지 않음
  '006': 404, // 회원가입을 위한 임시 회원 정보(OAuth 로그인시 자동 생성, auth 정보와 임시 발급된 닉네임 정보만 존재)가 존재하지 않음,
  '007': 403,
  '008': 400, // OAuth 리디렉션 후 전달받은 user 정보가 유효하지 않음,
  '009': 500, // 토큰 발급 과정에서 에러 발생
  '010': 401 // Referer가 올바르지 않음
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
