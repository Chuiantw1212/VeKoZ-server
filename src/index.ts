const time = new Date().getTime()
import { Elysia } from 'elysia'
import { node } from '@elysiajs/node'
import { cors } from '@elysiajs/cors'
import path from 'path'
// // entities
import AccessGlobalService from './entities/app'
// adapters
import firebase from './adapters/firebase.out'
import googleSecretManager from './adapters/googleSecretManager.out'
import googleCalendar from './adapters/googleCalendar.out'
import googleStoragePlugin from './adapters/googleStorage.out'
import NlpAdapter from './adapters/nlp.out'
// models
import PlaceModel from './domain/Place.model'
import SelectModel from './domain/Select.model';
import EventModel from './domain/Event.model'
import EventDesignModel from './domain/EventDesign.model'
import EventTemplateModel from './domain/EventTemplate.model'
import EventTemplateDesignModel from './domain/EventTemplateDesign.model'
import OrganizationModel from './domain/Organization.model'
import OrganizationMemberModel from './domain/OrganizationMember.model'
import UserModel from './domain/User.model'
import UserPreferenceModel from './domain/UserPreference.model'
import UserDesignModel from './domain/UserDesign.model'
import OfferModel from './domain/OfferModel'
// services
import MetaService from './domain/services/Meta.service';
import EventService from './domain/services/Event.service';
import EventTemplateService from './domain/services/EventTemplate.service'
import OrganizationService from './domain/services/Organization.service'
import AuthService from './domain/services/Auth.service'
import PlaceService from './domain/services/Place.service'
import UserService from './domain/services/User.service'
import UserTemplaceService from './domain/services/UserDesign.service'
import GoogleService from './domain/services/Google.service'
import OfferService from './domain/services/Offer.service'
import { ILocals } from './entities/app';
// controllers
import rootController from './adapters/client.in/root.ctrl'
import eventController from './adapters/client.in/event.ctrl'
import eventTemplateController from './adapters/client.in/eventTemplate.ctrl'
import organizationController from './adapters/client.in/organization.ctrl'
import placeController from './adapters/client.in/place.ctrl'
import userController from './adapters/client.in/user.ctrl'
import UserDesignController from './adapters/client.in/UserDesign.ctrl'
import googleController from './adapters/client.in/google.ctrl'
import metaController from './adapters/client.in/meta.ctrl'
import offerController from './adapters/client.in/offer.ctrl'

(async () => {
    const app = new Elysia({ adapter: node() })
    /**
     * Adapters
     */
    // Load firebase
    let FIREBASE_SERVICE_ACCOUNT_KEY_JSON = null
    try {
        FIREBASE_SERVICE_ACCOUNT_KEY_JSON = await googleSecretManager.accessSecret('FIREBASE_SERVICE_ACCOUNT_KEY_JSON')
    } catch (error: any) {
        console.trace('FIREBASE_SERVICE_ACCOUNT_KEY_JSON:', error.message)
        const keyPath = path.resolve(__dirname, '../FIREBASE_SERVICE_ACCOUNT_KEY_JSON.json')
        FIREBASE_SERVICE_ACCOUNT_KEY_JSON = require(keyPath);
    }
    await firebase.initializeSync(FIREBASE_SERVICE_ACCOUNT_KEY_JSON)

    // Load GCP
    let FIREBASE_API_KEY = null
    try {
        FIREBASE_API_KEY = await googleSecretManager.accessSecret('FIREBASE_API_KEY')
    } catch (error: any) {
        console.trace('FIREBASE_API_KEY:', error.message)
    }
    await googleCalendar.setClient(FIREBASE_API_KEY)

    // // // Load storage
    // await googleStoragePlugin.setClient(FIREBASE_API_KEY)
    // googleStoragePlugin.getPublicBucket()
    /**
     * Models
     */
    const selectModel = new SelectModel({
        collection: firebase.getCollection('selects'),
    })
    const eventModel = new EventModel({
        collection: firebase.getCollection('events'),
    })
    const eventDesignModel = new EventDesignModel({
        collection: firebase.getCollection('eventDesigns'),
        publicBucket: firebase.getPublicBucket()
    })
    const eventTemplateModel = new EventTemplateModel({
        collection: firebase.getCollection('eventTemplates')
    })
    const eventTemplateDesignModel = new EventTemplateDesignModel({
        collection: firebase.getCollection('eventTemplateDesigns'),
        publicBucket: firebase.getPublicBucket()
    })
    const organizationModel = new OrganizationModel({
        collection: firebase.getCollection('organizations'),
        publicBucket: firebase.getPublicBucket()
    })
    const organizationMemberModel = new OrganizationMemberModel({
        collection: firebase.getCollection('organizationMembers')
    })
    const placeModel = new PlaceModel({
        collection: firebase.getCollection('places')
    })
    const userModel = new UserModel({
        collection: firebase.getCollection('users')
    })
    const userPreferenceModel = new UserPreferenceModel({
        collection: firebase.getCollection('userPreferences')
    })
    const userDesignModel = new UserDesignModel({
        collection: firebase.getCollection('UserDesigns')
    })
    const offerModel = new OfferModel({
        collection: firebase.getCollection('offers')
    })

    const nlpAdapter = new NlpAdapter()

    /**
     * Services
     */
    const allServices: ILocals = {
        MetaService: new MetaService({
            selectModel,
        }),
        EventService: new EventService({
            eventModel,
            eventDesignModel,
            organizationModel,
            nlpAdapter,
            offerModel,
        }),
        EventTemplateService: new EventTemplateService({
            eventTemplateModel,
            eventTemplateDesignModel,
        }),
        OrganizationService: new OrganizationService({
            organizationModel,
            organizationMemberModel,
            eventModel,
            offerModel,
            eventDesignModel,
            eventTemplateDesignModel,
        }),
        PlaceService: new PlaceService({
            placeModel,
        }),
        AuthService: new AuthService(firebase),
        UserService: new UserService({
            userModel,
            userPreferenceModel
        }),
        UserDesignService: new UserTemplaceService({
            userModel,
            userDesignModel,
        }),
        GoogleService: new GoogleService({
            calendar: googleCalendar,
        }),
        OfferService: new OfferService({
            offerModel: offerModel,
        })
    }
    Object.assign(AccessGlobalService.locals, {
        ...allServices
    })

    /**
     * controllers
     */
    app
        .onError(({ error, code }) => {
            console.trace('Venonia Error:', {
                error
            })
            if (code === 'NOT_FOUND') return

            console.error(error)
        })
        .use(cors())
        .use(rootController)
        .use(eventController)
        .use(eventTemplateController)
        .use(organizationController)
        .use(placeController)
        .use(userController)
        .use(UserDesignController)
        .use(googleController)
        .use(metaController)
        .use(offerController)

    // Start Listening
    app.listen(8080, ({ hostname, port }) => {
        const timeEnd = new Date().getTime()
        const timeDiff = (timeEnd - time) / 1000
        AccessGlobalService.locals.startupTime = timeDiff
        console.log(
            `🦊 Elysia took ${timeDiff}s to run at ${hostname}:${port}`
        )
    })
})()