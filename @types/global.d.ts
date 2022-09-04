declare global {
  type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  type ErrorCode = `${Digit}${Digit}${Digit}`;
  type GoogleUserEmail = {
    value: string;
    verified: boolean;
  };

  interface GoogleUser {
    id: string;
    provider: string;
    emails: GoogleUserEmail[];
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
}

export {};
