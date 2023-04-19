import { Resolver, Query, Ctx, Arg, Authorized } from 'type-graphql';
import User from '../entities/user.entity';
import ReqContext from '../interfaces/ReqContext';
import { v4 } from 'uuid';
import { ApiUserError } from '../ utils/BaseError';
import { ServiceResponse } from '../interfaces/base.interface';
import { ethers } from 'ethers';
import pkg from 'jsonwebtoken';

const { sign } = pkg;
import * as dotenv from 'dotenv';

dotenv.config();

import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class Jwt {
  @Field()
  userAddress: string;
  @Field()
  jwt: string;

  constructor(userAddress: string, jwt: string) {
    this.userAddress = userAddress;
    this.jwt = jwt;
  }
}

function createNonce() {
  const nonce = v4();
  console.log('createNonce:nonce=', nonce);
  return nonce;
}

const UserServiceResponse = ServiceResponse(User);
const JwtServiceResponse = ServiceResponse(Jwt);

@Resolver()
export class UserResolver {
  @Query(() => UserServiceResponse)
  async getNonce(
    @Arg('userAddress') userAddress: string,
    @Ctx() ctx: ReqContext,
  ): Promise<typeof UserServiceResponse> {
    if (!ethers.utils.isAddress(userAddress)) {
      return new ApiUserError(this.constructor.name, 'invalid userAddress');
    }

    try {
      const { em } = ctx;
      const nonce = createNonce();
      const user = await em.findOne(User, { userAddress });
      if (user) {
        user.nonce = nonce;
        await em.flush();
        return user;
      } else {
        const newUser = new User(userAddress, nonce);
        await em.persistAndFlush(newUser);
        return newUser;
      }
    } catch (e) {
      return new ApiUserError(this.constructor.name, 'failed for nonce');
    }
  }

  @Query(() => JwtServiceResponse)
  async getJwt(
    @Arg('userAddress') userAddress: string,
    @Arg('message') message: string,
    @Arg('signature') signature: string,
    @Ctx() ctx: ReqContext,
  ): Promise<typeof JwtServiceResponse> {
    if (!ethers.utils.isAddress(userAddress)) {
      return new ApiUserError(this.constructor.name, 'invalid address');
    }
    const recover = ethers.utils.verifyMessage(message, signature);
    if (recover !== userAddress) {
      return new ApiUserError(
        this.constructor.name,
        'invalid signature or message',
      );
    }

    try {
      const { em } = ctx;
      const nonce = createNonce();
      const user = await em.findOne(User, { userAddress });
      if (user) {
        user.nonce = nonce;
        const jwt = sign(
          {
            id: user.id,
            userAddress,
            name: user.name,
          },
          process.env.JWT_SECRET,
          { expiresIn: '30d', jwtid: nonce, issuer: 'boa-space-backend' },
        );
        return new Jwt(userAddress, jwt);
      } else {
        return new ApiUserError(this.constructor.name, 'not user found');
      }
    } catch (e) {
      return new ApiUserError(this.constructor.name, 'failed for jwt');
    }
  }
}
