import { Request, Response } from 'express';
import Router from 'express-promise-router';
import { DI } from '../../application';

const router = Router();
// router.get(
//   '/:userId/:token',
//   async (req: Request, res: Response) => {
//     console.log('-- req.params :', req.params);
//     const user = await DI.userRepository.findOneOrFail({
//       id: req.params.userId, emailVerificationToken: req.params.token,
//     });
//
//       if (!user) {
//           throw new Error('Invalid token');
//       }
//
//       user.isVerified = true;
//       user.emailVerificationToken = undefined;
//       await DI.em.persistAndFlush(user);
//
//       return true;
//   },
// );


export const UserController = router;
