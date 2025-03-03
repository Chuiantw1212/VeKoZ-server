import { google, gmail_v1 } from "googleapis";
import { gmail } from "googleapis/build/src/apis/gmail";

// const { google } = require('googleapis');


export default class EmailAdapter {
    constructor(keyFile: any) {
        /**
         * https://developers.google.com/gmail/api/auth/scopes
         */
        const auth = new google.auth.GoogleAuth({
            credentials: keyFile,
            scopes: ['https://www.googleapis.com/auth/gmail.send'],
        });
        console.log({
            auth
        })
        const gmail = new gmail_v1.Gmail({
            auth,
        })
        console.log({
            gmail
        })
        const payload: gmail_v1.Schema$MessagePart = {
            headers: [{ name: 'Test', value: 'chuiantw1212@gmail.com' }],
            // body: {
            //     data: Buffer.from('測試內容').toString('base64')
            // }
        }
        // return
        // gmail.users.messages.list({
        //     userId: 'me'
        // })
        gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                payload,
            }
        })
    }
}