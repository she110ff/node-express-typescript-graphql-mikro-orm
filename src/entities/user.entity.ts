import {
  Collection,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  Property,
  Unique,
} from '@mikro-orm/core';
import { Field, ObjectType } from 'type-graphql';
import BaseET from './base.entity';

@ObjectType()
@Entity()
@Unique({ properties: ['userAddress'] })
export default class User extends BaseET {
  // ====== PROPERTIES ======//
  @Field()
  @Property()
  userAddress!: string;

  @Field()
  @Property()
  nonce!: string;

  @Field({ nullable: true })
  @Property({ type: 'string', nullable: true })
  name?: string;

  // ====== RELATIONS ======//

  // ====== RELATIONS ======//
  // ====== METHODS ======//
  // ====== GETTERS ======//
  // ====== MUTATORS ======//
  // ====== CONSTRUCTORS ======//
  constructor(userAddress: string, nonce: string, name: string = '') {
    // call the constructor for BaseEntity
    super();

    // assign the properties
    this.userAddress = userAddress;
    this.nonce = nonce;
    this.name = name;
  }
}
