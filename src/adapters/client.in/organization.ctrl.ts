import AccessGlobalService from '../../entities/app'
import type { IOrganization, IOrganizationMember } from '../../entities/organization'
import { Elysia, } from 'elysia'
import { bearer } from '@elysiajs/bearer'

const router = new Elysia()
router.use(bearer())
    .get('/organization/list', async () => {
        const { OrganizationService, } = AccessGlobalService.locals
        const organizations: IOrganization[] = await OrganizationService.getList()
        return organizations
    })
    .get('/organization/member/list', async ({ bearer }) => {
        const { AuthService, OrganizationService, } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const organization = await OrganizationService.getItem(user.uid)
        const organizationMembers: IOrganizationMember[] = await OrganizationService.getMemberList(user.uid, organization.id)
        return organizationMembers
    })
    .post('/organization', async ({ request, bearer }) => {
        const { OrganizationService, AuthService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const organization: IOrganization = await request.json() as any
        const logo = organization.logo // 暫存logo
        organization.logo = ''
        let newOrganization: IOrganization = OrganizationService.newItem(user.uid, organization)
        if (logo && typeof logo !== 'string') {
            const publicUrl: string = await OrganizationService.storeLogo(newOrganization.id, logo)
            newOrganization.logo = publicUrl
        }
        await OrganizationService.mergeUniqueDoc(user.uid, newOrganization)
    })
    .put('/organization', async ({ request, bearer }) => {
        const { OrganizationService, AuthService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const organization: IOrganization = await OrganizationService.getItem(user.uid)
        let newOrganization: IOrganization = await request.json() as any
        Object.assign(organization, {
            ...newOrganization
        })
        if (typeof organization.logo !== 'string') {
            const publicUrl: string = await OrganizationService.storeLogo(organization.id, organization.logo)
            organization.logo = publicUrl
        }
        await OrganizationService.mergeUniqueDoc(user.uid, organization)
    })
    .delete('/organization', async ({ bearer }) => {
        // TODO: 新增的管理者也可以刪除組織嗎？
        const { OrganizationService, AuthService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const organization: IOrganization = await OrganizationService.getItem(user.uid)
        const isSuccess = await OrganizationService.deleteItem(user.uid, organization.id)
        return isSuccess
    })
export default router