import { Request, Response } from 'express';

export interface IPayload {
  id: string;
  name: string;
  userAddress: string;
  iat: number;
  exp: number;
  iss: string;
  jti: string;
}

export interface IUser {
  id: string;
  name?: string;
  userAddress: string;
}

export interface BOAContext {
  req: Request;
  res: Response;
  user?: IUser;
}
