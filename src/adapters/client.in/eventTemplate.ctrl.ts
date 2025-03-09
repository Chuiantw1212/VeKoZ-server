import AccessGlobalService from '../../entities/app'
import { Elysia, } from 'elysia'
import { bearer } from '@elysiajs/bearer'
import type { IPostTemplateDesignReq, IPatchTemplateDesignReq, IEventTemplate } from '../../entities/eventTemplate'
import { IOrganizationMember } from '../../entities/organization'
const router = new Elysia()
router.use(bearer())
    .get('/event/template/:id', async function ({ bearer, params }) {
        const { EventTemplateService, } = AccessGlobalService.locals
        const { id } = params
        const result = await EventTemplateService.getTemplate(id)
        return result
    })
    .get('/event/template/default', async function ({ bearer, params }) {
        const { EventTemplateService, } = AccessGlobalService.locals
        const designs = await EventTemplateService.getDefaultTemplateDesigns()
        const result: IEventTemplate = {
            designs,
        }
        return result
    })
    .get('/event/template/list', async function ({ bearer, request, query }) {
        const { EventTemplateService, AuthService, OrganizationMemberService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const { organizerId } = query
        const impersonatedMember: IOrganizationMember = {
            uid: user.uid,
            allowMethods: [request.method]
        }
        if (organizerId) {
            const userMembership = await OrganizationMemberService.checkMemberAuths({
                email: String(user.email),
                organizationId: String(organizerId),
                allowMethods: [request.method],
            })
            impersonatedMember.uid = userMembership.uid
            impersonatedMember.allowMethods = userMembership.allowMethods
        }
        const templates = await EventTemplateService.getTemplateMasterList(impersonatedMember, {
            organizerId,
        })
        return templates
    })
    .post('/event/template', async function ({ request, bearer }) {
        const { EventTemplateService, AuthService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const eventTemplate = await request.json()
        const result = await EventTemplateService.addEventTemplate(user.uid, eventTemplate)
        return result
    })
    .patch('/event/template/:id', async function ({ request, bearer, params }) {
        const { EventTemplateService, AuthService, OrganizationService, OrganizationMemberService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const { id } = params
        const eventTemplate: IEventTemplate = await request.json()
        const { organizerId, organizerLogo, organizerName } = eventTemplate
        if (organizerId && (!organizerLogo || !organizerName)) {
            const organization = await OrganizationService.getItem(organizerId)
            eventTemplate.organizerLogo = organization.logo
            eventTemplate.organizerName = organization.name
        }
        const impersonatedMember = await OrganizationMemberService.checkMemberAuths({
            email: String(user.email),
            organizationId: String(eventTemplate.organizerId),
            allowMethods: [request.method]
        })
        const impersonatedUid = String(impersonatedMember.uid)
        const result = await EventTemplateService.patchTemplate(impersonatedUid, id, eventTemplate)
        return result
    })
    .delete('/event/template', async function ({ bearer, query, request }) {
        const { EventTemplateService, AuthService, OrganizationMemberService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const { id: templateId, organizationId } = query
        let impersonatedUid = user.uid
        if (organizationId) {
            const impersonatedMember = await OrganizationMemberService.checkMemberAuths({
                email: String(user.email),
                organizationId: String(organizationId),
                allowMethods: [request.method]
            })
            impersonatedUid = String(impersonatedMember.uid)
        }
        const count = await EventTemplateService.deleteTemplate(impersonatedUid, templateId)
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