const time = new Date().getTime()
import { Elysia } from 'elysia'
import { node } from '@elysiajs/node'
import { cors } from '@elysiajs/cors'
import path from 'path'
// // entities
import AccessGlobalService from './entities/app'
// adapters
import firebase from './adapters/firebase.out'
import googleCloud from './adapters/googleCloud.out'
// models
import AccommodationModel from './domain/Accommodation.model'
import SelectModel from './domain/Select.model';
import EventModel from './domain/Event.model'
import EventActorModel from './domain/EventActor.model'
import EventTemplateModel from './domain/EventTemplate.model'
import OrganizationModel from './domain/Organization.model'
import OrganizationMemberModel from './domain/OrganizationMember.model'
// services
import MetaService from './domain/services/Meta.service';
import EventService from './domain/services/Event.service';
import OrganizationService from './domain/services/Organization.service'
import AuthService from './domain/services/Auth.service'
import AccommodationService from './domain/services/Accmmodation.service'
// services.others
import { ILocals } from './entities/app';
// controllers
import rootController from './adapters/client.in/root.ctrl'
import eventController from './adapters/client.in/event.ctrl'
import organizationController from './adapters/client.in/organization.ctrl'
import accommodationController from './adapters/client.in/accommodation.ctrl'

(async () => {
    const app = new Elysia({ adapter: node() })
    /**
     * Adapters
     */
    // Load firebase
    let FIREBASE_SERVICE_ACCOUNT_KEY_JSON = null
    try {
        FIREBASE_SERVICE_ACCOUNT_KEY_JSON = await googleCloud.accessSecret('FIREBASE_SERVICE_ACCOUNT_KEY_JSON')
    } catch (error: any) {
        console.trace('FIREBASE_SERVICE_ACCOUNT_KEY_JSON:', error.message)
        const keyPath = path.resolve(__dirname, '../FIREBASE_SERVICE_ACCOUNT_KEY_JSON.json')
        FIREBASE_SERVICE_ACCOUNT_KEY_JSON = require(keyPath);
    }
    await firebase.initializeSync(FIREBASE_SERVICE_ACCOUNT_KEY_JSON)

    /**
     * Models
     */
    const selectModel = new SelectModel(firebase.firestore)
    const eventModel = new EventModel(firebase.firestore)
    const eventActorModel = new EventActorModel(firebase.firestore)
    const eventTemplateModel = new EventTemplateModel(firebase.firestore)
    const organizationModel = new OrganizationModel(firebase)
    const organizationMemberModel = new OrganizationMemberModel(firebase.firestore)
    const accommodationModel = new AccommodationModel(firebase.firestore)

    /**
     * Services
     */
    const allServices: ILocals = {
        MetaService: new MetaService({
            selectModel,
        }),
        EventService: new EventService({
            eventModel,
            eventActorModel,
            eventTemplateModel,
        }),
        OrganizationService: new OrganizationService({
            organizationModel,
            organizationMemberModel,
        }),
        AccomdationService: new AccommodationService({
            accommodationModel,
        }),
        AuthService: new AuthService(firebase)
    }
    Object.assign(AccessGlobalService.locals, {
        ...allServices
    })

    /**
     * controllers
     */
    app
        .onError(({ error, code }) => {
            console.trace({
                error
            })
            if (code === 'NOT_FOUND') return

            console.error(error)
        })
        .use(cors())
        .use(rootController)
        .use(eventController)
        .use(organizationController)
        .use(accommodationController)

    // Start Listening
    app.listen(8080, ({ hostname, port }) => {
        console.log(
            `🦊 Elysia is running at ${hostname}:${port}`
        )
        const timeEnd = new Date().getTime()
        const timeDiff = (timeEnd - time) / 1000
        AccessGlobalService.locals.startupTime = timeDiff
    })
})()