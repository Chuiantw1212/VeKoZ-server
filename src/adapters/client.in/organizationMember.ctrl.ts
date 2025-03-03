import AccessGlobalService from '../../entities/app'
import type { IOrganization, IOrganizationMember } from '../../entities/organization'
import { Elysia, } from 'elysia'
import { bearer } from '@elysiajs/bearer'

const router = new Elysia()
router.use(bearer())
    .get('/organization/:id/member/list', async ({ bearer, params }) => {
        const { AuthService, OrganizationMemberService, } = AccessGlobalService.locals
        const { id } = params
        const user = await AuthService.verifyIdToken(bearer)
        const organizationMembers: IOrganizationMember[] = await OrganizationMemberService.getMemberList(user.uid, id)
        return organizationMembers
    })
    .post('/organization/member', async ({ request, params }) => {
        const { OrganizationMemberService, } = AccessGlobalService.locals
        const organizatoinMember = await request.json() as IOrganizationMember
        await OrganizationMemberService.inviteMember(organizatoinMember)
        // return organization
    })
export default router