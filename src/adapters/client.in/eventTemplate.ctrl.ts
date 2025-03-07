import AccessGlobalService from '../../entities/app'
import { Elysia, } from 'elysia'
import { bearer } from '@elysiajs/bearer'
import type { IPostTemplateDesignReq, IPatchTemplateDesignReq, IEventTemplate } from '../../entities/eventTemplate'
const router = new Elysia()
router.use(bearer())
    .get('/event/template/:id', async function ({ bearer, params }) {
        const { EventTemplateService, AuthService, } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const { id } = params
        const result = await EventTemplateService.getTemplate(user.uid, id)
        return result
    })
    .get('/event/template/list', async function ({ bearer, request }) {
        const { EventTemplateService, AuthService, OrganizationMemberService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const membership = await OrganizationMemberService.getRelatedMembership(String(user.email), {
            allowMethods: ['GET'],
        })
        const promises = membership.items.map(async member => {
            const impersonatedUid = await OrganizationMemberService.checkMemberAuths(
                String(user.email),
                String(member.organizationId),
                request.method,
            )
            return EventTemplateService.getEventTemplateList(impersonatedUid)
        })
        const templateFromOrgs = await Promise.all(promises)
        const allTemplates = templateFromOrgs.reduce((a, b) => {
            return [...a, ...b]
        }, [])
        return allTemplates
    })
    .post('/event/template', async function ({ request, bearer }) {
        const { EventTemplateService, AuthService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const eventTemplate = await request.json()
        const result = await EventTemplateService.addEventTemplate(user.uid, eventTemplate)
        return result
    })
    .patch('/event/template/:id', async function ({ request, bearer, params }) {
        const { EventTemplateService, AuthService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const { id } = params
        const eventTemplatePart: IEventTemplate = await request.json()
        const result = await EventTemplateService.patchTemplate(user.uid, id, eventTemplatePart)
        return result
    })
    .delete('/event/template', async function ({ bearer, query, request }) {
        const { EventTemplateService, AuthService, OrganizationMemberService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const { id: templateId, organizationId } = query
        const authUid = await OrganizationMemberService.checkMemberAuths(
            String(user.email),
            String(organizationId),
            request.method
        )
        const count = await EventTemplateService.deleteTemplate(authUid, templateId)
        return count
    })
    .post('/event/template/design', async function ({ request, bearer }) {
        const { EventTemplateService, AuthService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const eventTemplateDesign: IPostTemplateDesignReq = await request.json() as any
        const desginId = await EventTemplateService.postDesign(user.uid, eventTemplateDesign)
        return desginId
    })
    .delete('/event/template/design/:id', async function ({ bearer, params }) {
        const { EventTemplateService, AuthService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const { id } = params
        const lastmod = await EventTemplateService.deleteDesignById(user.uid, id)
        return lastmod
    })
    .patch('/event/template/design', async function ({ request, bearer }) {
        const { EventTemplateService, AuthService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const patchRequest: IPatchTemplateDesignReq = await request.json()
        const lastmod = await EventTemplateService.patchTemplateDesign(user.uid, patchRequest)
        return lastmod
    })
export default router