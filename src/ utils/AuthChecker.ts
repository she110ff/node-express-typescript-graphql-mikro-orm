import { AuthChecker } from 'type-graphql';
import { BOAContext } from '../interfaces/context.interface';

export const customAuthChecker: AuthChecker<BOAContext> = ({
  args,
  context,
  info,
}) => {
  console.log('args :', args);
  return !!context.user; // or false if access is denied
};
