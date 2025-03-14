import AccessGlobalService from '../../entities/app'
import { Elysia, } from 'elysia'
import { bearer } from '@elysiajs/bearer'
import { IEvent, IEventQuery } from '../../entities/event'
import type { IEventTemplate, ITemplateDesign, } from '../../entities/eventTemplate'
import { IOrganizationMember } from '../../entities/organization'
const router = new Elysia()
router.use(bearer())
    /**
     * 也用於公開資料取得
     */
    .get('/event/list', async function ({ query, bearer }) {
        const { EventService, AuthService, OrganizationMemberService } = AccessGlobalService.locals
        const eventQuery = query as IEventQuery
        const eventList = await EventService.queryEventList(eventQuery)
        if (bearer && eventQuery.allowMethods) {
            const user = await AuthService.verifyIdToken(bearer)
            const impersonatedMember = await OrganizationMemberService.getMemberByQuery({
                email: String(user.email),
                organizationId: eventQuery.organizerId,
                allowMethods: eventQuery.allowMethods,
            })
            eventList.forEach(event => {
                event.allowMethods = impersonatedMember.allowMethods
            })
        }
        return eventList
    })
    /**
     * 也用於公開資料取得
     */
    .get('/event', async function ({ request, bearer, query }) {
        const { AuthService, EventService, OrganizationMemberService } = AccessGlobalService.locals
        const eventQuery = query as IEventQuery
        if (bearer) {
            // 可編輯
            const user = await AuthService.verifyIdToken(bearer)
            const userMembership = await OrganizationMemberService.getMemberByQuery({
                email: String(user.email),
                organizationId: String(eventQuery.organizerId),
                allowMethods: [request.method],
            })
            const event = await EventService.getEventByQuery(String(eventQuery.id), userMembership.uid)
            if (event) {
                event.allowMethods = userMembership.allowMethods
            }
            return event
        } else {
            // 僅共檢視
            const event = await EventService.getEventByQuery(String(eventQuery.id))
            return event
        }
    })
    .post('/event', async function ({ request, bearer }) {
        const { AuthService, EventService, OrganizationMemberService, } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const event = await request.json() as IEventTemplate
        const userMembership = await OrganizationMemberService.getMemberByQuery({
            email: String(user.email),
            organizationId: String(event.organizerId),
            allowMethods: [request.method],
        })
        const result = await EventService.createNewEvent(String(userMembership.uid), event)
        return result
    })
    /**
     * 拖曳月曆的事件時使用
     */
    .patch('/event/calendar', async function ({ request, bearer }) {
        const { AuthService, EventService, OrganizationMemberService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const event = await request.json() as IEvent
        const userMembership = await OrganizationMemberService.getMemberByQuery({
            email: String(user.email),
            organizationId: String(event.organizerId),
            allowMethods: [request.method],
        })
        const result = await EventService.patchEventCalendar(String(userMembership.uid), event)
        return result
    })
    /**
     * 變更事件表單中的值使用
     */
    .patch('/event/form', async function ({ request, bearer }) {
        const { AuthService, EventService, OrganizationMemberService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const templateDesign = await request.json() as ITemplateDesign
        const userMembership = await OrganizationMemberService.getMemberByQuery({
            email: String(user.email),
            organizationId: String(templateDesign.organizerId),
            allowMethods: [request.method],
        })
        const result = await EventService.patchEventForm(String(userMembership.uid), templateDesign)
        return result
    })
    .delete('/event', async function ({ request, bearer, query }) {
        const { EventService, AuthService, OrganizationMemberService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const eventQuery = query as IEventQuery
        const userMembership = await OrganizationMemberService.getMemberByQuery({
            email: String(user.email),
            organizationId: String(eventQuery.organizerId),
            allowMethods: [request.method],
        })
        const event = await EventService.deleteEvent(String(userMembership.uid), String(eventQuery.id))
        return event
    })
export default router