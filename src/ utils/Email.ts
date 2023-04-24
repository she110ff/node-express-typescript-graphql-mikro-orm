import User from '../entities/user.entity';
import nodemailer from 'nodemailer';

const createTransporter = () => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_EMAIL_USERNAME,
            pass: process.env.SMTP_EMAIL_PASSWORD,
        },
    });
    return transporter
}
export const sendVerificationEmail = async (user: User) => {
    const transporter = createTransporter()
    const mailOptions = {
        from: process.env.SMTP_EMAIL_USERNAME,
        to: user.email,
        subject: '[MetaSherpa] Email verification',
        html: `<p>Click <a href={process.env.SERVER_URL}/verify-email/${user.id}">here</a> to verify your email address.</p>`,
    };

    await transporter.sendMail(mailOptions);
};


export const sendForgotPasswordEmail = async (email: string, token: string) => {
    const transporter = createTransporter()
    const mailOptions = {
        from: process.env.SMTP_EMAIL_USERNAME,
        to: email,
        subject: `[MetaSherpa] Password Recovery`,
        html: `<p>Click <a href={process.env.SERVER_URL}/verify-email/${token}">here</a> to recovery your password.</p>`,
    };

    await transporter.sendMail(mailOptions);
};