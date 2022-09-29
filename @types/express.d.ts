declare module Express {
  type TokenStatus = 'NO_TOKEN' | 'VALID' | 'INVALID';

  interface RequestToken {
    status: TokenStatus;
    token?: string;
    userId?: number;
  }

  interface Request {
    tempUserName: string;
    accessToken: RequestToken;
    refreshToken: RequestToken;
    user: User;
    disableVerifyRefreshToken: boolean;
  }

  interface User {
    id: string;
    provider: string;
    email: string;
  }
}
