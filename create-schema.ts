import { MikroORM } from '@mikro-orm/core';
import config from './src/mikro-orm.config';
import User from './src/entities/user.entity';

(async () => {
  const orm = await MikroORM.init(config);
  const generator = orm.getSchemaGenerator();

  const users = await orm.em.find(User, {});
  // or you can run those queries directly, but be sure to check them first!
  if (users.length < 1) {
    await generator.refreshDatabase();
  }

  await orm.close(true);
})();
