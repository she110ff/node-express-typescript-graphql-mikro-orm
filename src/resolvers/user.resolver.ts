import {Resolver, Query, Ctx, Arg, Authorized, Mutation} from 'type-graphql';
import User from '../entities/user.entity';
import ReqContext from '../interfaces/ReqContext';
import {
  createAccessToken,
  createRefreshToken,
  createResetPasswordToken,
  sendRefreshToken,
  verifyGoogleToken,
  verifyRefreshTokens,
} from '../ utils/Auth';
import {sendForgotPasswordEmail, sendVerificationEmail} from '../ utils/Email';

import { Field, ObjectType } from 'type-graphql';
import process from 'process';
import {
  ITokenPayload
} from '../interfaces/context.interface';
import {wrap} from '@mikro-orm/core';

import pkg from 'jsonwebtoken';
const { sign } = pkg;
import argon2 from 'argon2';

import * as dotenv from 'dotenv';

dotenv.config();



/*
register: 새로운 사용자를 등록하고,
새로운 리프레시 토큰을 생성하여 HTTP 응답의 쿠키로 설정하는 함수 입니다.
login: 사용자 이름 또는 이메일 주소와 비밀번호를 사용하여 사용자를 인증하고,
새로운 리프레시 토큰을 생성하여 HTTP 응답의 쿠키로 설정하는 함수 입니다.
verifyEmail: 이메일 주소 인증을 처리하는 함수입니다.
me: 현재 로그인한 사용자의 정보를 반환하는 함수입니다.
RefreshTokens : 클라이언트에서 쿠키로 전달받은 리프레시 토큰을 검증하여 새로운 액세스 토큰을 발급하고,
응답 객체에 새로운 액세스 토큰을 반환합니다.
logout: 현재 로그인한 사용자를 로그아웃하는 함수입니다.
changePassword :  사용자의 비밀번호를 변경하는 함수입니다. 사용자는 기존 비밀번호를 입력하고,
새로운 비밀번호를 입력하여 비밀번호를 변경할 수 있습니다.
forgotPassword : 사용자의 비밀번호 분실시 이메일로 새로운 비밀번호 입력하여 변경합니다.
googleLogin: 구글 계정으로 로그인하는 함수입니다.
*/


@ObjectType()
export class AccessTokenResponse {
  @Field()
  accessToken!: string;

  @Field({ nullable: true })
  refreshToken?: string;
}

@Resolver()
export class UserResolver {
  @Mutation(() => Boolean)
  async register(
      @Arg('email') email: string,
      @Arg('password') password: string,
      @Ctx() ctx: ReqContext,
  ): Promise<boolean> {
    const { em, res } = ctx;
    const user = await em.findOne(User, { email });
    if (user) {
      throw new Error('The user is already registered.');
    }
    const hashedPassword = await argon2.hash(password);
    const newUser = new User(
      email,
      hashedPassword,
    );

    try {
      await em.persistAndFlush(newUser);
    } catch (err) {
      console.log(err);
      return false;
    }

    await sendVerificationEmail(newUser);
    sendRefreshToken(res, createRefreshToken(newUser));

    return true;
  }

  @Mutation(() => AccessTokenResponse)
  async login(
      @Arg('email') email: string,
      @Arg('password') password: string,
      @Ctx() { em, res }: ReqContext
  ): Promise<AccessTokenResponse> {
    const user = await em.findOne(User, { email });
    if (!user) {
      throw new Error('Invalid login');
    }
    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      throw new Error('Invalid login');
    }
    if (!user.isVerified) {
      throw new Error('User email is not verified');
    }
    const accessToken = createAccessToken(user);
    sendRefreshToken(res, createRefreshToken(user));
    await em.persistAndFlush(user);

    return {
      accessToken
    };
  }

  @Mutation(() => Boolean)
  async verifyEmail(
      @Arg('emailVerificationToken') emailVerificationToken: string,
      @Ctx() { em }: ReqContext
  ): Promise<boolean> {
    const user = await em.findOne(User, { emailVerificationToken });
    if (!user) {
      throw new Error('Invalid user');
    }

    user.isVerified = true;
    user.emailVerificationToken = undefined;

    return true
  }

  @Authorized()
  @Query(() => User, { nullable: true })
  async me(@Ctx() { em, user }: ReqContext): Promise<User | null> {
    const userInfo = await em.findOne(User, { id: user.userId });
    if (!userInfo) {
      console.log(`User with id ${user.userId} not found`);
      return null;
    }

    return userInfo;
  }

  @Authorized()
  @Mutation(() => Boolean)
  async logout(@Ctx() { res }: ReqContext) {
    sendRefreshToken(res, '');

    return true;
  }

  @Authorized()
  @Mutation(() => AccessTokenResponse)
  async refreshTokens(@Ctx() { em, req, res }: ReqContext):
      Promise<AccessTokenResponse> {
    const payload:ITokenPayload | null
        = verifyRefreshTokens(req, process.env.JWT_SECRET!)

    if (!payload) {
      throw new Error('Invalid payload');
    }

    const user = await em.findOne(User,{ id: payload.userId });
    if (!user) {
      throw new Error('Invalid user');
    }

    const accessToken = createAccessToken(user);
    sendRefreshToken(res, createRefreshToken(user));
    await em.persistAndFlush(user);

    return {
      accessToken
    };
  }

  @Authorized()
  @Mutation(() => Boolean)
  async changePassword(
      @Arg('currentPassword') currentPassword: string,
      @Arg('newPassword') newPassword: string,
      @Ctx() { em, user }: ReqContext
  ): Promise<boolean> {
    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    const userInfo = await em.findOne(User, {id:user.userId});
    if (!userInfo) {
      throw new Error('User not found');
    }

    const valid = userInfo.validatePassword(newPassword);
    if (!valid) {
      throw new Error('Invalid password');
    }

    const hashedPassword = await argon2.hash(newPassword);
    wrap(userInfo).assign({ password: hashedPassword });

    return true;
  }

  @Mutation(() => Boolean)
  async forgotPassword(
      @Arg('email') email: string,
      @Ctx() { em }: ReqContext): Promise<boolean> {
    const userInfo = await em.findOne(User, { email });
    if (!userInfo) {
      throw new Error('User does not exist');
    }

    const token = createResetPasswordToken(email);
    await sendForgotPasswordEmail(email, token);

    return true;
  }
}
