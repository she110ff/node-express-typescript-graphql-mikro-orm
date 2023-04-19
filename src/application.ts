import express from 'express';
import { createServer, Server } from 'http';
import cors from 'cors';
import * as dotenv from 'dotenv';
import ws from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { buildSchema } from 'type-graphql';
import { ApolloServer } from 'apollo-server-express';
import { Connection, IDatabaseDriver, MikroORM } from '@mikro-orm/core';

import { graphqlUploadExpress } from 'graphql-upload-ts';

import config from './mikro-orm.config';
import { UserResolver } from './resolvers/user.resolver';
import { customAuthChecker } from './ utils/AuthChecker';
import { verify } from 'jsonwebtoken';
import User from './entities/user.entity';
import { IPayload, IUser } from './interfaces/context.interface';

dotenv.config();

export default class Application {
  public orm!: MikroORM<IDatabaseDriver<Connection>>;
  public expressApp!: express.Application;
  public httpServer!: Server;
  public apolloServer!: ApolloServer;
  public subscriptionServer!: ws.Server;

  public connect = async (): Promise<void> => {
    try {
      this.orm = await MikroORM.init(config);
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

    // generate the graphql schema
    const schema = await buildSchema({
      resolvers: [
        UserResolver,
      ],
      validate: false,
      authChecker: customAuthChecker,
    });

    // initialize the ws server to handle subscriptions
    this.subscriptionServer = new ws.Server({
      server: this.httpServer,
      path: '/graphql',
    });

    // initalize the apollo server, passing in the schema and then
    // defining the context each query/mutation will have access to
    this.apolloServer = new ApolloServer({
      schema,
      context: ({ req, res }) => {
        const authorization = req.headers.authorization;
        let payload: IPayload | null = null;
        if (authorization) {
          try {
            const token = authorization.split(' ')[1];
            payload = verify(token, process.env.JWT_SECRET);
          } catch (e) {
            console.log('auth verification error:', e);
          }
        }
        const user: IUser | null = payload
          ? {
              id: payload.id,
              name: payload.name,
              userAddress: payload.userAddress,
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
        // we need to use a callback here since the subscriptionServer is scoped
        // to the class and would not exist otherwise in the plugin definition
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

    // you need to start the server BEFORE applying middleware
    await this.apolloServer.start();
    // pass the express app and the cors config to the middleware
    this.apolloServer.applyMiddleware({
      app: this.expressApp,
      cors: corsOptions,
    });

    const port = process.env.PORT || 4001;
    this.httpServer.listen(port, () => {
      // pass in the schema and then the subscription server
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
