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
        const organizations: IOrganization[] = await OrganizationService.getOrganizationList(user.uid)
        return organizations
    })
    .get('/organization/:id/member/list', async ({ bearer, params }) => {
        const { AuthService, OrganizationService, } = AccessGlobalService.locals
        const { id } = params
        const user = await AuthService.verifyIdToken(bearer)
        const organizationMembers: IOrganizationMember[] = await OrganizationService.getMemberList(user.uid, id)
        return organizationMembers
    })
    .post('/organization', async ({ request, bearer }) => {
        const { OrganizationService, AuthService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const organization: IOrganization = await request.json() as any
        const newOrganization = await OrganizationService.newItem(user.uid, organization)
        return newOrganization
    })
    .put('/organization', async ({ request, bearer }) => {
        const { OrganizationService, AuthService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        let newOrganization: IOrganization = await request.json() as any
        await OrganizationService.updateOrganization(user.uid, newOrganization)
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