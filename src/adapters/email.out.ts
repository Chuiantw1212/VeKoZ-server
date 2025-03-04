import { google, gmail_v1 } from "googleapis";
import { IOrganization } from "../entities/organization";

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
    subject?: string,
    recipientName?: string,
    recipientEmail?: string,
    organization?: any,
    html?: string,
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
            subject = '空白的主旨',
            recipientEmail,
            recipientName = '新用戶',
            html,
        } = emailMessage
        /**
         * 中文編碼問題
         * =?charset?encoding?encoded-text?=
         */
        const utf8Sender = `=?utf-8?B?${Buffer.from('VeKoZ 微課室').toString('base64')}?=`;
        const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
        const utf8Recipient = `=?utf-8?B?${Buffer.from(recipientName).toString('base64')}?=`;
        const messageParts = [
            `From: ${utf8Sender} <en.chu@vekoz.org>`,
            `To: ${utf8Recipient} <${recipientEmail}>`,
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

    getInvitation(emailMessage: IEmailMessage) {
        const {
            subject,
            organization,
            recipientName,
        } = emailMessage

        const {
            name: organizatoinName = '未命名的組織',
            logo: organizatoinLogo = 'https://storage.googleapis.com/public.vekoz.org/logo/160_160.png',
        } = organization

        return `
            <!DOCTYPE html>
            <html lang="zh-TW">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${subject}</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f8f8f8; padding: 20px;">
                <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
                    
                    <!-- Logo -->
                    <div style="text-align: center;">
                        <img src="${organizatoinLogo}" alt="${organizatoinName}" style="width: 120px; margin-bottom: 10px;">
                    </div>

                    <h2 style="color: #333; text-align: center;">邀請您加入 <span style="color: #EA4335;">${organizatoinName}</span>！</h2>
                    <p>親愛的 ${recipientName} 您好，</p>
                    <p>我們正在 <strong>VeKoZ 微課室</strong> 平台上建立專屬組織 <strong>${organizatoinName}</strong>，希望邀請您加入，一起協作、規劃與執行精彩活動！</p>
                    <p>VeKoZ 微課室是一個專為活動主辦方打造的線上平台，讓講師能夠順暢管理課程、分享資源，並提升活動運營效率。</p>
                    
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="[您的邀請連結]" style="background: #4285F4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 16px; display: inline-block; cursor: pointer">🚀 點擊此處加入 ${organizatoinName}</a>
                    </div>

                    <hr style="border: none; height: 1px; background: #EA4335; margin: 20px 0;">

                    <p><strong>如何加入？</strong></p>
                    <ul>
                        <li><strong>如果您已經註冊 VeKoZ 微課室：</strong> 點擊後將直接開啟組織頁面。</li>
                        <li><strong>如果您尚未註冊：</strong> 系統將引導您完成註冊，之後即可順利加入。</li>
                    </ul>

                    <p>期待您的加入，讓我們攜手打造更優質的學習與活動體驗！</p>
                    
                    <p>如有任何問題，請隨時與我們聯繫。</p>
                    
                    <p>祝順心，</p>
                    <p><strong>${organizatoinName} 團隊</strong><br>
                </div>
            </body>
            </html>
            `
    }
}