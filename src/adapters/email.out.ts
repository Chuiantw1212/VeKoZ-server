import { google, gmail_v1 } from "googleapis";

interface IServiceAccount {
    "type": string,
    "project_id": string,
    "private_key_id": string,
    "private_key": string,
    "client_email": string,
    "client_id": string,
    "auth_uri": string,
    "token_uri": string,
    "auth_provider_x509_cert_url": string,
    "client_x509_cert_url": string,
    "universe_domain": string,
}

interface IEmailMessage {
    subject: string,
    recipientName: string,
    recipientEmail: string,
    html: string,
}

export default class EmailAdapter {
    private gmail: gmail_v1.Gmail
    constructor(credentials: IServiceAccount) {
        /**
         * 不同的授權範圍
         * https://developers.google.com/gmail/api/auth/scopes
         */
        /**
         * 不需要密碼的授權方式
         * Developers can register their web applications and other API clients with Google to 
         * enable access to data in Google services like Gmail. 
         * 
         * You can authorize these registered clients to access your user data without your users having to 
         * individually give consent or their passwords.
         * https://admin.google.com/ac/owl/domainwidedelegation
         */
        /**
         * JWT service account credentials.
         * Retrieve access token using gtoken.
         * @param email service account email address.
         * @param keyFile path to private key file.
         * @param key value of key
         * @param scopes list of requested scopes or a single scope.
         * @param subject impersonated account's email address.
         * @param key_id the ID of the key
         */
        const auth = new google.auth.GoogleAuth({
            credentials: credentials,
            scopes: [
                // read用於測試是否Email服務掛掉 
                'https://www.googleapis.com/auth/gmail.readonly',
                'https://www.googleapis.com/auth/gmail.send'
            ],
            clientOptions: {
                subject: 'en.chu@vekoz.org',
            }
        });
        const gmail = new gmail_v1.Gmail({
            auth,
        })
        this.gmail = gmail
    }

    async send(emailMessage: IEmailMessage) {
        const {
            subject,
            recipientEmail,
            recipientName = '未知的用戶',
            html,
        } = emailMessage

        /**
         * 中文編碼問題
         * =?charset?encoding?encoded-text?=
         */
        const utf8Sender = `=?utf-8?B?${Buffer.from('VeKoZ 微課室').toString('base64')}?=`;
        const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
        const messageParts = [
            `From: ${utf8Sender} <en.chu@vekoz.org>`,
            `To: ${recipientName} <${recipientEmail}>`,
            `Reply-To: chuiantw1212@gmail.com`,
            'Content-Type: text/html; charset=utf-8',
            'MIME-Version: 1.0',
            `Subject: ${utf8Subject}`,
            '',
            html,
        ];
        const message = messageParts.join('\n');

        // The body needs to be base64url encoded.
        const encodedMessage = Buffer.from(message)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        this.gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedMessage,
            },
        })
    }
}