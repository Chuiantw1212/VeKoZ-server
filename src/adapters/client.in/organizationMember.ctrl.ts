import AccessGlobalService from '../../entities/app'
import type { IOrganization, IOrganizationMember } from '../../entities/organization'
import { Elysia, } from 'elysia'
import { bearer } from '@elysiajs/bearer'
import { IPagination } from '../../entities/meta'

const router = new Elysia()
router.use(bearer())
    .get('/organization/:id/member/list', async ({ bearer, params, query }) => {
        const { AuthService, OrganizationMemberService, } = AccessGlobalService.locals
        const { id } = params
        const user = await AuthService.verifyIdToken(bearer)
        const pagination = query as any
        const result = await OrganizationMemberService.getMemberList(user.uid, id, pagination)
        return result
    })
    .post('/organization/member', async ({ bearer, request, }) => {
        const { AuthService, OrganizationMemberService, } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const organizatoinMember = await request.json() as IOrganizationMember
        const newMember = await OrganizationMemberService.inviteMember(user.uid, organizatoinMember)
        return newMember
    })
    .delete('/organization/member/:email', async ({ bearer, params, query }) => {
        const { AuthService, OrganizationMemberService, } = AccessGlobalService.locals
        const { email } = params
        const user = await AuthService.verifyIdToken(bearer)
        const count = await OrganizationMemberService.deleteMember(user.uid, email)
        return count
    })
export default router