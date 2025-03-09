import AccessGlobalService from '../../entities/app'
import { Elysia, } from 'elysia'
import { bearer } from '@elysiajs/bearer'
import type { ITemplateDesignQuery, IEventTemplate, IEventTemplateQuery, ITemplateDesign } from '../../entities/eventTemplate'
import { IOrganizationMember } from '../../entities/organization'
const router = new Elysia()
router.use(bearer())
    .get('/event/template/:id', async function ({ bearer, params }) {
        const { EventTemplateService, } = AccessGlobalService.locals
        const { id } = params
        const result = await EventTemplateService.getTemplateById(id)
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
        const { organizerId } = query as IEventTemplateQuery
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
        const { EventTemplateService, AuthService, OrganizationMemberService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const eventTemplate = await request.json()
        const userMembership = await OrganizationMemberService.checkMemberAuths({
            email: String(user.email),
            organizationId: String(eventTemplate.organizerId),
            allowMethods: [request.method],
        })
        const impersonatedUid = String(userMembership.uid)
        const result = await EventTemplateService.addEventTemplate(impersonatedUid, eventTemplate)
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
        const { id: templateId, organizerId } = query as IEventTemplateQuery
        let impersonatedUid = user.uid
        if (organizerId) {
            const impersonatedMember = await OrganizationMemberService.checkMemberAuths({
                email: String(user.email),
                organizationId: String(organizerId),
                allowMethods: [request.method]
            })
            impersonatedUid = String(impersonatedMember.uid)
        }
        const count = await EventTemplateService.deleteTemplate(impersonatedUid, String(templateId))
        return count
    })
    .post('/event/template/design', async function ({ request, bearer }) {
        const { EventTemplateService, AuthService, OrganizationMemberService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const eventTemplateDesign = await request.json() as ITemplateDesignQuery
        const impersonatedMember = await OrganizationMemberService.checkMemberAuths({
            email: String(user.email),
            organizationId: String(eventTemplateDesign.organizerId),
            allowMethods: [request.method]
        })
        const impersonatedUid = String(impersonatedMember.uid)
        const desginId = await EventTemplateService.postDesign(impersonatedUid, eventTemplateDesign)
        return desginId
    })
    .delete('/event/template/design/:id', async function ({ bearer, params }) {
        const { EventTemplateService, AuthService, OrganizationMemberService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const { id } = params
        // const impersonatedMember = await OrganizationMemberService.checkMemberAuths({
        //     email: String(user.email),
        //     organizationId: String(eventTemplateDesign.organizerId),
        //     allowMethods: [request.method]
        // })
        // const impersonatedUid = String(impersonatedMember.uid)
        const count = await EventTemplateService.deleteDesignById(user.uid, id)
        return count
    })
    .patch('/event/template/design', async function ({ request, bearer }) {
        const { EventTemplateService, AuthService, OrganizationMemberService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const templateDesign = await request.json() as ITemplateDesign
        const impersonatedMember = await OrganizationMemberService.checkMemberAuths({
            email: String(user.email),
            organizationId: String(templateDesign.organizerId),
            allowMethods: [request.method]
        })
        const impersonatedUid = String(impersonatedMember.uid)
        const count = await EventTemplateService.patchTemplateDesign(impersonatedUid, templateDesign)
        return count
    })
export default router