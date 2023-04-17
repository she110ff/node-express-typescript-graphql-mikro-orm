import Application from './application';
import 'reflect-metadata';
import * as dotenv from 'dotenv';

dotenv.config();

export const PRODUCTION = process.env.NODE_ENV === 'production';
export let application: Application;

async function main() {
  console.log('NODE_DEV :', process.env.NODE_DEV);
  console.log('POSTGRES_DB :', process.env.POSTGRES_DB);
  application = new Application();
  await application.connect();
  await application.init();
}

main();
