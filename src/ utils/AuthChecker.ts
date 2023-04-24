import { AuthChecker } from 'type-graphql';
import {UserContext} from '../interfaces/context.interface';

export const customAuthChecker: AuthChecker<UserContext> = ({
  args,
  context,
  info,
}) => {
  console.log('args :', args);
  return !!context.user; // or false if access is denied
};
