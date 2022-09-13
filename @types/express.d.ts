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
    user: User;
    addon: Record<string, any>;
  }

  interface User {
    id: string;
    provider: string;
    email: string;
  }
}
