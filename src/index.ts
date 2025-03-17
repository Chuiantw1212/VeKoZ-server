const time = new Date().getTime()
import { Elysia } from 'elysia'
import { node } from '@elysiajs/node'
import { cors } from '@elysiajs/cors'
// entities
import AccessGlobalService from './entities/app'
// adapters
import firebase from './adapters/firebase.out'
import googleSecretManager from './adapters/googleSecretManager.out'
import googleCalendar from './adapters/googleCalendar.out'
import BlobAdapter from './adapters/BlobAdapter.out'
import NlpAdapter from './adapters/nlp.out'
import EmailAdapter from './adapters/email.out'
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
import OrganizationMemberService from './domain/services/OrganizationMember.service'
import AuthService from './domain/services/Auth.service'
import PlaceService from './domain/services/Place.service'
import UserService from './domain/services/User.service'
import UserTemplaceService from './domain/services/UserDesign.service'
import GoogleService from './domain/services/Google.service'
import OfferService from './domain/services/Offer.service'
import { ILocals } from './entities/app'
// controllers
import rootController from './adapters/client.in/root.ctrl'
import eventController from './adapters/client.in/event.ctrl'
import eventTemplateController from './adapters/client.in/eventTemplate.ctrl'
import organizationController from './adapters/client.in/organization.ctrl'
import organizationMemberController from './adapters/client.in/organizationMember.ctrl'
import placeController from './adapters/client.in/place.ctrl'
import userController from './adapters/client.in/user.ctrl'
import userDesignController from './adapters/client.in/userDesign.ctrl'
import googleController from './adapters/client.in/google.ctrl'
import metaController from './adapters/client.in/meta.ctrl'
import offerController from './adapters/client.in/offer.ctrl'

(async () => {
    const app = new Elysia({ adapter: node() })
    let ENV = null
    try {
        ENV = await googleSecretManager.accessSecret('ENV')
    } catch (error: any) {
        console.trace('ENV:', error.message)
        return
    }
    /**
     * Adapters
     */
    let FIREBASE_SERVICE_ACCOUNT_KEY_JSON = null
    try {
        FIREBASE_SERVICE_ACCOUNT_KEY_JSON = await googleSecretManager.accessSecret('FIREBASE_SERVICE_ACCOUNT_KEY_JSON')
    } catch (error: any) {
        console.trace('FIREBASE_SERVICE_ACCOUNT_KEY_JSON:', error.message)
        return
    }
    await firebase.initializeSync(FIREBASE_SERVICE_ACCOUNT_KEY_JSON)
    const nlpAdapter = new NlpAdapter()
    const emailAdapter = new EmailAdapter(FIREBASE_SERVICE_ACCOUNT_KEY_JSON)
    /**
     * Models
     */
    const publicBucket = firebase.getPublicBucket()
    const selectModel = new SelectModel({
        collection: firebase.getCollection('selects'),
    })
    const eventModel = new EventModel({
        collection: firebase.getCollection('events'),
    })
    const eventDesignModel = new EventDesignModel({
        collection: firebase.getCollection('eventDesigns'),
        publicBucket: new BlobAdapter('eventDesigns', publicBucket),
    })
    const eventTemplateModel = new EventTemplateModel({
        collection: firebase.getCollection('eventTemplates')
    })
    const eventTemplateDesignModel = new EventTemplateDesignModel({
        collection: firebase.getCollection('eventTemplateDesigns'),
        publicBucket: new BlobAdapter('eventTemplateDesigns', publicBucket),
    })
    const organizationModel = new OrganizationModel({
        collection: firebase.getCollection('organizations'),
        publicBucket: new BlobAdapter('organizations', publicBucket),
    })
    const organizationMemberModel = new OrganizationMemberModel({
        collection: firebase.getCollection('organizationMembers')
    })
    const placeModel = new PlaceModel({
        collection: firebase.getCollection('places')
    })
    const userModel = new UserModel({
        collection: firebase.getCollection('users'),
        publicBucket: new BlobAdapter('users', publicBucket)
    })
    const userPreferenceModel = new UserPreferenceModel({
        collection: firebase.getCollection('userPreferences')
    })
    const userDesignModel = new UserDesignModel({
        collection: firebase.getCollection('userDesigns'),
        publicBucket: new BlobAdapter('userDesigns', publicBucket)
    })
    const offerModel = new OfferModel({
        collection: firebase.getCollection('offers')
    })

    /**
     * Services
     */
    const allServices: ILocals = {
        MetaService: new MetaService({
            selectModel,
        }),
        OrganizationService: new OrganizationService({
            organizationModel,
            organizationMemberModel,
            eventModel,
            eventTemplateModel,
            offerModel,
            eventDesignModel,
            eventTemplateDesignModel,
            nlpAdapter,
            placeModel,
        }),
        OrganizationMemberService: new OrganizationMemberService({
            emailAdapter,
            organizationMemberModel,
            organizationModel,
            userModel,
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
            organizationMemberModel,
        }),
        PlaceService: new PlaceService({
            placeModel,
            organizationModel,
        }),
        AuthService: new AuthService(firebase),
        UserService: new UserService({
            userModel,
            userPreferenceModel,
            userDesignModel,
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

            // console.error(error)
        })
        .use(cors())
        .use(rootController)
        .use(eventController)
        .use(eventTemplateController)
        .use(organizationController)
        .use(placeController)
        .use(userController)
        .use(userDesignController)
        .use(googleController)
        .use(metaController)
        .use(offerController)
        .use(organizationMemberController)

    // Start Listening
    app.listen(8080, ({ hostname, port }) => {
        const timeEnd = new Date().getTime()
        const timeDiff = (timeEnd - time) / 1000
        AccessGlobalService.startupTime = timeDiff
        AccessGlobalService.env = ENV
        console.log(
            `🦊 Elysia took ${timeDiff}s to run at ${hostname}:${port}`
        )
    })
})()