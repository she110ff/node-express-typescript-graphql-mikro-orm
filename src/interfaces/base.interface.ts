import { ClassType, createUnionType } from 'type-graphql';
import { BaseError } from '../ utils/BaseError';

export function ServiceResponse<T>(cls: ClassType<T>) {
  return createUnionType({
    name: `${cls.name}ServiceResponse`,
    types: () => [cls, BaseError] as const,
    resolveType: (value) =>
      (value as BaseError).statusCode === undefined ? cls : BaseError,
  });
}
