import * as dotenv from 'dotenv';
dotenv.config();

import { Options } from '@mikro-orm/core';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';

const config: Options = {
  migrations: {
    path: `${__dirname}/migrations`,
    tableName: 'migrations',
    transactional: true,
    snapshot: false,
    safe: true,
    allOrNothing: true,
  },
  seeder: {
    path: 'seeders',
    pathTs: 'src/seeders',
  },
  // path to our JS entities (dist), relative to `baseDir`
  entities: ['./entities/**/*.js'],
  // path to our TS entities (source), relative to `baseDir`
  entitiesTs: ['./src/entities/**/*.ts'],
  type: 'postgresql',
  forceUtcTimezone: true,
  tsNode: process.env.NODE_DEV === 'true' ? true : false,
  allowGlobalContext: process.env.NODE_DEV === 'true' ? true : false,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  dbName: process.env.POSTGRES_DB,
  host: process.env.POSTGRES_HOST,
  port: 5433,
  debug: !process.env.PRODUCTION,
  highlighter: !process.env.PRODUCTION ? new SqlHighlighter() : undefined,
  pool: {
    max: 10,
    idleTimeoutMillis: 10000,
  },
  schemaGenerator: {
    // wrap statements with `set foreign_key_checks = 0` or equivalent
    disableForeignKeys: true,
    createForeignKeyConstraints: true, // whether to generate FK constraints
    ignoreSchema: [], // allows ignoring some schemas when diffing
  },
};

export default config;
