import {
  Collection,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  Property,
  Unique, ValidationError,
} from '@mikro-orm/core';
import { Field, ObjectType } from 'type-graphql';
import BaseET from './base.entity';

@ObjectType()
@Entity()
@Unique({ properties: ['userAddress'] })
export default class User extends BaseET {
  // ====== PROPERTIES ======//
  @Field({ nullable: true })
  @Property({ nullable: true })
  userAddress?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  nonce?: string;

  @Field(() => String)
  @Property({ type: 'text', unique: true })
  email!: string;

  @Field(() => String)
  @Property({ type: 'text' })
  password!: string;

  @Field(() => String)
  @Property({ type: 'text', nullable: true })
  resetPassword?: string;

  @Field(() => Boolean)
  @Property({ type: 'boolean', default: false })
  isVerified!: boolean;

  @Field({nullable: true })
  @Property({ type: 'text', nullable: true })
  emailVerificationToken?: string;

  @Field(() => String)
  @Property({ type: 'text', nullable: true })
  refreshToken?: string;

  // ====== RELATIONS ======//
  // ====== RELATIONS ======//
  // ====== METHODS ======//

  /*
  정규식은 다음 조건을 충족하는 문자열을 검증합니다.
  -------------------------------
  최소 8자 이상
  최소한 하나 이상의 대문자 포함
  최소한 하나 이상의 소문자 포함
  최소한 하나 이상의 숫자 포함
  최소한 하나 이상의 특수문자 포함
  */
  validatePassword(password: string) {
    const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!@#$%^&*()_+-=]).{8,}$/;
    if (!passwordRegex.test(password)) {
      throw new ValidationError('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
    }
    return true
  }

  // ====== GETTERS ======//
  // ====== MUTATORS ======//
  // ====== CONSTRUCTORS ======//
  constructor(email: string, password: string) {
    // call the constructor for BaseEntity
    super();

    // assign the properties
    this.email = email;
    this.validatePassword(password);
    this.password = password;
  }
}
