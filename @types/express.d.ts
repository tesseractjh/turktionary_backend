declare module Express {
  type TokenStatus = 'NO_TOKEN' | 'VALID' | 'INVALID';

  interface RequestToken {
    status: TokenStatus;
    userId?: number;
  }

  interface Request {
    tempUserName: string;
    accessToken: RequestToken;
    refreshToken: RequestToken;
  }
}
