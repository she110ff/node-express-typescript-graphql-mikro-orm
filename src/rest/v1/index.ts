import Router from 'express-promise-router';
import { UserController } from './user.controller';

const router = Router();

router.use('/user', UserController);

export const V1Router = router;
