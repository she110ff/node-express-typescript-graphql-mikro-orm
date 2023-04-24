import { sign } from 'jsonwebtoken';
import User from '../entities/user.entity';
import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import { verify } from 'jsonwebtoken';
import {OAuth2Client, TokenPayload} from 'google-auth-library';
import {ITokenPayload} from '../interfaces/context.interface';

export const createAccessToken = (user: User) => {
    return sign({ userId: user.id, email: user.email },
        process.env.ACCESS_TOKEN_SECRET!, {
        expiresIn: '15m',
    });
};

export const createRefreshToken = (user: User) => {
    const refreshToken = sign(
        { userId: user.id, email: user.email },
        process.env.REFRESH_TOKEN_SECRET!,
        { expiresIn: '7d' }
    );
    return refreshToken;
};

export const createResetPasswordToken = (email: string) => {
    return sign({ email },
        process.env.RESET_PASSWORD_TOKEN_SECRET!, {
            expiresIn: '1h',
        });
};

export const sendRefreshToken = (res: Response, token: string) => {
    res.cookie('jti', token, {
        httpOnly: true,
    });
};

export const verifyAccessToken = (req: Request, secret: string) => {
    const authorization = req.headers.authorization;
    let payload: ITokenPayload | null = null;
    if (authorization) {
        try {
            const token = authorization.split(' ')[1];
            payload = verify(token, secret);
        } catch (e) {
            console.log('auth verification error:', e);
        }
    }
    return payload
};

export const verifyRefreshTokens =  (req: Request, secret:string) => {
    const token = req.cookies.jid;
    let payload: ITokenPayload | null = null;
    if (!token) {
        return payload;
    }

    try {
        payload = verify(token, secret);
    } catch (err) {
        console.log(err);
    }
    return payload
};

export const verifyGoogleToken = async (token: string):
    Promise<TokenPayload | undefined> => {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    //
    // const email = payload.email!;
    // const firstName = payload.given_name || '';
    // const lastName = payload.family_name || '';
    // const username = email.split('@')[0];
    // const user = User.findOne({ email });
    //
    // if (!user) {
    //     const newUser = User.create({
    //         firstName,
    //         lastName,
    //         email,
    //         username,
    //         isVerified: true,
    //     });
    //
    //     await User.persistAndFlush(newUser);
    //
    //     return newUser;
    // }
    //
    return payload;
};
