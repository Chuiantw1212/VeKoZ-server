import AccessGlobalService from '../../entities/app'
import type { IOrganization, IOrganizationMember } from '../../entities/organization'
import { Elysia, } from 'elysia'
import { bearer } from '@elysiajs/bearer'

const router = new Elysia()
router.use(bearer())
    .get('/organization/:id', async ({ params }) => {
        const { OrganizationService, } = AccessGlobalService.locals
        const { id } = params
        const organization: IOrganization = await OrganizationService.getItem(id)
        return organization
    })
    .get('/organization/list', async ({ bearer }) => {
        const { AuthService, OrganizationService, } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const organizations: IOrganization[] = await OrganizationService.getOrganizationList(String(user.email))
        return organizations
    })
    .post('/organization', async ({ request, bearer }) => {
        const { OrganizationService, AuthService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const organization: IOrganization = await request.json() as any
        const newOrganization = await OrganizationService.newItem(user.uid, {
            name: user.name ?? '',
            email: user.email,
            organizationName: organization.name,
            isFounder: true,
            allowMethods: ['GET', 'PATCH', 'POST', 'DELETE'],
        })
        return newOrganization
    })
    .patch('/organization', async ({ request, bearer }) => {
        const { OrganizationService, AuthService, OrganizationMemberService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const organization: IOrganization = await request.json() as any
        const authUid = await OrganizationMemberService.checkMemberAuths(
            String(user.email),
            String(organization.id),
            request.method
        )
        await OrganizationService.updateOrganization(authUid, organization)
    })
    .delete('/organization/:id', async ({ bearer, params }) => {
        // TODO: 新增的管理者也可以刪除組織嗎？
        const { OrganizationService, AuthService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const { id } = params
        const isSuccess = await OrganizationService.deleteItem(user.uid, id)
        return isSuccess
    })
export default router