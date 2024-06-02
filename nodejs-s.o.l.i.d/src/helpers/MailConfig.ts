import nodemailer from 'nodemailer';
import config from './EnvConfig'

const { email_user, email_password, email_provider } = config

const transporter = nodemailer.createTransport({
    service: email_provider,
    auth: {
        user: email_user,
        pass: email_password,
    },
});

export default transporter;
