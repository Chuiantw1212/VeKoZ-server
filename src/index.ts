import { Elysia } from 'elysia'
import { node } from '@elysiajs/node'
// services.others
import { ILocals } from './entities/app';

// adapters
import firebase from './adapters/firebase.out.ts'
import googleCloud from './adapters/googleCloud.out.ts'
import chatGpt from './adapters/chatGpt.out'

// models
import SelectModel from './domain/Select.model';

// services
import MetaService from './domain/services/Meta.service';

// controllers
import rootController from './adapters/client.in/root.ctrl'

(async () => {
    const app = new Elysia({ adapter: node() })
    /**
     * Adapters
     */
    let OPENAI_API_KEY: string = ''
    try {
        OPENAI_API_KEY = await googleCloud.accessSecret('OPENAI_API_KEY')
    } catch (error: any) {
        console.trace('OPENAI_API_KEY:', error.message)
        const keyPath = path.resolve(__dirname, '../OPEN_API_KEY.json')
        OPENAI_API_KEY = require(keyPath);
    }
    chatGpt.initializeSync(OPENAI_API_KEY)
    // Load firebase
    let FIREBASE_SERVICE_ACCOUNT_KEY_JSON = null
    try {
        FIREBASE_SERVICE_ACCOUNT_KEY_JSON = await googleCloud.accessSecret('FIREBASE_SERVICE_ACCOUNT_KEY_JSON')
    } catch (error: any) {
        console.trace('FIREBASE_SERVICE_ACCOUNT_KEY_JSON:', error.message)
        const keyPath = path.resolve(__dirname, '../FIREBASE_SERVICE_ACCOUNT_KEY_JSON.json')
        FIREBASE_SERVICE_ACCOUNT_KEY_JSON = require(keyPath);
    }
    const firestore = await firebase.initializeSync(FIREBASE_SERVICE_ACCOUNT_KEY_JSON)


    /**
    * models
    */
    const selectModel = new SelectModel(firestore)

    /**
     * Services
     */
    const allServices: ILocals = {
        MetaService: new MetaService({
            model:
        })
    }

    /**
    * controllers
    */
    app.use(rootController)

    app.listen(8080, ({ hostname, port }) => {
        console.log(
            `🦊 Elysia is running at ${hostname}:${port}`
        )
    })

})()