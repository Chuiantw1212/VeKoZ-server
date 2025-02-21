import AccessGlobalService from '../../entities/app'
import { Elysia, } from 'elysia'
import { bearer } from '@elysiajs/bearer'
import { IEvent, IEventQuery } from '../../entities/event'
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
    /**
     * 拖曳月曆的事件時使用
     */
    .patch('/event/calendar', async function ({ request, bearer }) {
        const { AuthService, EventService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const event = await request.json() as IEvent
        const result = await EventService.patchEventCalendar(user.uid, event)
        return result
    })
    /**
     * 變更事件表單中的值使用
     */
    .patch('/event/form', async function ({ request, bearer }) {
        const { AuthService, EventService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const templateDesign = await request.json() as ITemplateDesign
        const result = await EventService.patchEventForm(user.uid, templateDesign)
        return result
    })
    // /**
    //  * 變更
    //  */
    // .patch('/event/:id', async function ({ request, bearer }) {
    //     const { AuthService, EventService } = AccessGlobalService.locals
    //     const user = await AuthService.verifyIdToken(bearer)
    //     const templateDesign = await request.json() as ITemplateDesign
    //     const result = await EventService.patchEventForm(user.uid, templateDesign)
    //     return result
    // })
    .get('/event/:id', async function ({ params, bearer }) {
        const { AuthService, EventService } = AccessGlobalService.locals
        const { id } = params
        const user = await AuthService.verifyIdToken(bearer)
        const event = await EventService.getEvent(id, user.uid)
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
        const eventQuery = query as IEventQuery
        const eventList = await EventService.queryEventList(eventQuery)
        return eventList
    })
export default router