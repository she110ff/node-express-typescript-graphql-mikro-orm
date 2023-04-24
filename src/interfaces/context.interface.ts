import { Request, Response } from 'express';

export interface ITokenPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
  iss: string;
  jti: string;
}

export interface IUser {
  userId: string;
  email?: string;
  name?: string;
}

export interface UserContext {
  req: Request;
  res: Response;
  user?: IUser;
}
