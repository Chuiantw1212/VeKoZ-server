import AccessGlobalService from '../../entities/app'
import type { IOrganization, IOrganizationMember } from '../../entities/organization'
import { Elysia, } from 'elysia'
import { bearer } from '@elysiajs/bearer'

const router = new Elysia()
router.use(bearer())
    .get('/organization/list', async () => {
        const { OrganizationService, } = AccessGlobalService.locals
        const organizations: IOrganization[] = await OrganizationService.getOrganizationList()
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
        const logo = organization.logo // 暫存logo
        organization.logo = ''
        let newOrganization: IOrganization = await OrganizationService.newItem(user.uid, organization)
        if (logo && typeof logo !== 'string') {
            const publicUrl: string = await OrganizationService.storeLogo(user.uid, newOrganization.id, logo)
            newOrganization.logo = publicUrl
        }
        await OrganizationService.mergeUniqueDoc(user.uid, newOrganization)
        return newOrganization
    })
    .put('/organization/:id', async ({ request, bearer, params }) => {
        const { OrganizationService, AuthService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const { id } = params
        const organization: IOrganization = await OrganizationService.getItem(id)
        let newOrganization: IOrganization = await request.json() as any
        Object.assign(organization, {
            ...newOrganization
        })
        if (typeof organization.logo !== 'string') {
            const publicUrl: string = await OrganizationService.storeLogo(user.uid, organization.id, organization.logo)
            organization.logo = publicUrl
        }
        await OrganizationService.mergeUniqueDoc(user.uid, organization)
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