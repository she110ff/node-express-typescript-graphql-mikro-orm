import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class BaseError extends Error {
  @Field()
  name: string;
  @Field()
  statusCode: number;
  @Field()
  isOperational: string;

  constructor(name, statusCode, isOperational, description) {
    super(description);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this);
  }
}

export class ApiUserError extends BaseError {
  constructor(
    name,
    description = 'Failed for User',
    statusCode = 810,
    isOperational = true,
  ) {
    super(name, statusCode, isOperational, description);
  }
}
