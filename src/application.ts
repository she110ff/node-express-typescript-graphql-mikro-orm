import express from 'express';
import { createServer, Server } from 'http';
import cors from 'cors';
import * as dotenv from 'dotenv';
import ws from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { buildSchema } from 'type-graphql';
import { ApolloServer } from 'apollo-server-express';
import {
  Connection,
  EntityManager,
  EntityRepository,
  IDatabaseDriver,
  MikroORM,
  RequestContext,
} from '@mikro-orm/core';

import { graphqlUploadExpress } from 'graphql-upload-ts';

import config from './mikro-orm.config';
import { UserResolver } from './resolvers/user.resolver';
import { customAuthChecker } from './ utils/AuthChecker';
import { verify } from 'jsonwebtoken';
import User from './entities/user.entity';
import { ITokenPayload, IUser } from './interfaces/context.interface';
import {verifyAccessToken} from './ utils/Auth';
import * as process from 'process';

dotenv.config();

export const DI = {} as {
  orm: MikroORM;
  em: EntityManager;
  userRepository: EntityRepository<User>;
};

export default class Application {
  public orm!: MikroORM<IDatabaseDriver<Connection>>;
  public expressApp!: express.Application;
  public httpServer!: Server;
  public apolloServer!: ApolloServer;
  public subscriptionServer!: ws.Server;
  public connect = async (): Promise<void> => {
    try {
      this.orm = await MikroORM.init(config);
      DI.orm = this.orm;
      DI.em = DI.orm.em;
      DI.userRepository = DI.em.getRepository(User);

      const migrator = this.orm.getMigrator();
      const migrations = await migrator.getPendingMigrations();
      if (migrations && migrations.length > 0) {
        await migrator.up();
      }
    } catch (error) {
      console.error('📌 Could not connect to the database', error);
      throw Error(String(error));
    }
  };

  public async init() {
    this.expressApp = express();
    this.httpServer = createServer(this.expressApp);

    const corsOptions = {
      origin: '*', // FIXME: change me to fit your configuration
    };

    this.expressApp.use(
      cors(corsOptions),
      graphqlUploadExpress({ maxFileSize: 10_000_000, maxFiles: 10 }),
    );

    this.expressApp.get('/', (_req, res) => res.send('Hello, World!'));

    const schema = await buildSchema({
      resolvers: [
        UserResolver,
      ],
      validate: false,
      authChecker: customAuthChecker,
    });

    this.subscriptionServer = new ws.Server({
      server: this.httpServer,
      path: '/graphql',
    });

    this.apolloServer = new ApolloServer({
      schema,
      context: ({ req, res }) => {
        const payload = verifyAccessToken(req, process.env.JWT_SECRET!)
        const user: IUser | null = payload
          ? {
              userId: payload.userId,
              email: payload.email,
            }
          : null;

        return {
          req,
          res,
          user,
          em: this.orm.em.fork(),
        };
      },
      formatError: (error) => {
        console.log('GraphQL error\n:', error);
        return error;
      },
      plugins: [
        (subscriptionServer = this.subscriptionServer) => {
          return {
            async serverWillStart() {
              return {
                async drainServer() {
                  subscriptionServer.close();
                },
              };
            },
          };
        },
      ],
    });

    await this.apolloServer.start();
    this.apolloServer.applyMiddleware({
      app: this.expressApp,
      cors: corsOptions,
    });

    const port = process.env.PORT || 4001;
    this.httpServer.listen(port, () => {
      useServer(
        {
          schema,
          context: { em: this.orm.em.fork() },
        },
        this.subscriptionServer,
      );
      console.log(`httpServer listening at http://localhost:${port}`);
    });
  }
}
