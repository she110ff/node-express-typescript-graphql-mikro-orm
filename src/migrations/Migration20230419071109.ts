import { Migration } from '@mikro-orm/migrations';

export class Migration20230419071109 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "user" ("id" uuid not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "user_address" varchar(255) not null, "nonce" varchar(255) not null, "name" varchar(255) null default \'\', constraint "user_pkey" primary key ("id"));');
    this.addSql('alter table "user" add constraint "user_user_address_unique" unique ("user_address");');
  }

}
