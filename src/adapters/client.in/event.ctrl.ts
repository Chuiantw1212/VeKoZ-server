import AccessGlobalService from '../../entities/app'
import { Elysia, } from 'elysia'
import { bearer } from '@elysiajs/bearer'
import { IEvent } from '../../entities/event'
import type { IEventTemplate, ITemplateDesign, } from '../../entities/eventTemplate'
const router = new Elysia()
router.use(bearer())
    .post('/event', async function ({ request, bearer }) {
        const { AuthService, EventService, } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const event = await request.json() as IEventTemplate
        const result = await EventService.createNewEvent(user.uid, event)
        return result
    })
    .patch('/event/calendar', async function ({ request, bearer }) {
        const { AuthService, EventService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const event = await request.json() as IEvent
        const result = await EventService.patchEventCalendar(user.uid, event)
        return result
    })
    .patch('/event/form', async function ({ request, bearer }) {
        const { AuthService, EventService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const templateDesign = await request.json() as ITemplateDesign
        const result = await EventService.patchEventForm(user.uid, templateDesign)
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
        const eventList = await EventService.queryEventList(eventQuery)
        return eventList
    })
export default router