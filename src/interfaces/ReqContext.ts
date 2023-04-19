import { Connection, EntityManager, IDatabaseDriver } from '@mikro-orm/core';
import { Request, Response } from 'express';
import { IUser } from './context.interface';

export default interface ReqContext {
  req: Request;
  res: Response;
  user: IUser;
  em: EntityManager<IDatabaseDriver<Connection>>;
}
