import { Elysia } from 'elysia'
import { node } from '@elysiajs/node'
import path from 'path'

// services.others
import { ILocals } from './entities/app';

// adapters
import firebase from './adapters/firebase.out'
import googleCloud from './adapters/googleCloud.out'

// models
import SelectModel from './domain/Select.model';
import EventModel from './domain/Event.model'
import EventActorModel from './domain/EventActor.model'
import EventTemplateModel from './domain/EventTemplate.model'

// services
import MetaService from './domain/services/Meta.service';

// controllers
import rootController from './adapters/client.in/root.ctrl'
import eventController from './adapters/client.in/event.ctrl'
import EventService from './domain/services/Event.service';

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
    const eventModel = new EventModel(firestore)
    const eventActorModel = new EventActorModel(firestore)
    const eventTemplateModel = new EventTemplateModel(firestore)

    /**
     * Services
     */
    const allServices: ILocals = {
        MetaService: new MetaService({
            model: selectModel,
        }),
        EventService: new EventService({
            eventModel,
            eventActorModel,
            eventTemplateModel,
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