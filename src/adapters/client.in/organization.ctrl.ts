import AccessGlobalService from '../../entities/app'
import type { IOrganization, IOrganizationMember, IOrganizationQuery } from '../../entities/organization'
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
    .get('/organization/list', async ({ bearer, query }) => {
        const { AuthService, OrganizationService, } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const organizationQuery = query as IOrganizationQuery
        if (organizationQuery.name) {
            const organizations: IOrganization[] = await OrganizationService.getOrganizationList(organizationQuery)
            return organizations
        } else {
            return []
            // throw '尚未實裝'
        }
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
        const impersonatedMember = await OrganizationMemberService.getMemberByQuery({
            email: String(user.email),
            organizationId: String(organization.id),
            allowMethods: [request.method]
        })
        try {
            const count = OrganizationService.updateOrganization(String(impersonatedMember.uid), organization)
            return count
        } catch (error) {
            console.trace(error)
        }
    })
    .delete('/organization/:id', async ({ bearer, params }) => {
        // 新增的管理者不可以刪除組織，用戶只可以刪除自己建立的組織
        const { OrganizationService, AuthService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const { id } = params
        const count = await OrganizationService.deleteItem(user.uid, id)
        return count
    })
export default router