import AccessGlobalService from '../../entities/app'
import { Elysia, } from 'elysia'
import { bearer } from '@elysiajs/bearer'
import type { IEventTemplate } from '../../entities/eventTemplate'
const router = new Elysia()
router.use(bearer())
    .post('/event', async function ({ request, bearer }) {
        const { AuthService, EventService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const event = await request.json() as IEventTemplate
        const result = await EventService.createNewEvent(user.uid, event)
        return result
    })
    .get('/event/:id', async function ({ params }) {
        const { EventService } = AccessGlobalService.locals
        const { id } = params
        const event = await EventService.getEvent(id)
        return event
    })
    .delete('/event/:id', async function ({ params, bearer }) {
        const { EventService, AuthService } = AccessGlobalService.locals
        const { id } = params
        const user = await AuthService.verifyIdToken(bearer)
        const event = await EventService.deleteEvent(user.uid, id)
        return event
    })
    .get('/event/list', async function ({ query }) {
        const { EventService } = AccessGlobalService.locals
        const eventQuery = query as any
        const eventList = await EventService.getEventRecords(eventQuery)
        return eventList
    })
    .get('/event/template', async function ({ bearer }) {
        const { EventService, AuthService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const eventTemplate = await EventService.getTemplate(user.uid)
        return eventTemplate
    })
    .put('/event/template', async function ({ request, bearer }) {
        const { EventService, AuthService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const eventTemplate = await request.json() as any
        const result = await EventService.putTemplate(user.uid, eventTemplate)
        return result
    })
export default router