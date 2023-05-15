import { Migration } from '@mikro-orm/migrations';

export class Migration20230512015355 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" add column "email" text not null, add column "password" text not null, add column "reset_password" text null, add column "is_verified" boolean not null default false, add column "email_verification_token" text null, add column "refresh_token" text null;');
    this.addSql('alter table "user" alter column "user_address" type varchar(255) using ("user_address"::varchar(255));');
    // tslint:disable-next-line:max-line-length
    this.addSql('alter table "user" alter column "user_address" drop not null;');
    this.addSql('alter table "user" alter column "nonce" type varchar(255) using ("nonce"::varchar(255));');
    this.addSql('alter table "user" alter column "nonce" drop not null;');
    this.addSql('alter table "user" add constraint "user_email_unique" unique ("email");');
  }

  async down(): Promise<void> {
    this.addSql('alter table "user" add column "name" varchar null default \'\';');
    this.addSql('alter table "user" alter column "user_address" type varchar using ("user_address"::varchar);');
    this.addSql('alter table "user" alter column "user_address" set not null;');
    this.addSql('alter table "user" alter column "nonce" type varchar using ("nonce"::varchar);');
    this.addSql('alter table "user" alter column "nonce" set not null;');
    this.addSql('alter table "user" drop constraint "user_email_unique";');
  }

}
