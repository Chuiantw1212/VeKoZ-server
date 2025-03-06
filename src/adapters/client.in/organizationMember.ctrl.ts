import AccessGlobalService from '../../entities/app'
import type { IOrganizationMember } from '../../entities/organization'
import { Elysia, } from 'elysia'
import { bearer } from '@elysiajs/bearer'
import { IPagination } from '../../entities/meta'

const router = new Elysia()
router.use(bearer())
    .get('/organization/member/list/:organizationId', async ({ bearer, params, query, request }) => {
        const { AuthService, OrganizationMemberService, } = AccessGlobalService.locals
        const { organizationId } = params
        const user = await AuthService.verifyIdToken(bearer)
        const authUid = await OrganizationMemberService.checkMemberAuths(
            String(user.email),
            String(organizationId),
            request.method
        )
        const pagination = query as IPagination
        const result = await OrganizationMemberService.getMemberList(authUid, organizationId, pagination)
        return result
    })
    .post('/organization/member', async ({ bearer, request, }) => {
        /**
         * 要補上權限認定
         */
        const { AuthService, OrganizationMemberService, } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const organizatoinMember = await request.json() as IOrganizationMember
        const authUid = await OrganizationMemberService.checkMemberAuths(
            String(user.email),
            String(organizatoinMember.organizationId),
            request.method
        )
        const newMember = await OrganizationMemberService.inviteMember(authUid, organizatoinMember)
        return newMember
    })
    .patch('/organization/member', async ({ bearer, request, }) => {
        const { AuthService, OrganizationMemberService, } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const organizatoinMember = await request.json() as IOrganizationMember
        // const authUid = await OrganizationMemberService.checkMemberAuths(
        //     String(user.email),
        //     String(organizatoinMember.organizationId),
        //     request.method
        // )
        const count = await OrganizationMemberService.setMemberById(user.uid, organizatoinMember)
        return count
    })
    .delete('/organization/member', async ({ bearer, request, }) => {
        const { AuthService, OrganizationMemberService, } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const organizatoinMember = await request.json() as IOrganizationMember
        if (user.email === organizatoinMember.email) {
            // 刪除的是自己的資料
            const authUid = await OrganizationMemberService.checkMemberAuths(
                String(user.email),
                String(organizatoinMember.organizationId),
                'GET',
            )
            const count = await OrganizationMemberService.deleteMemberByEmail({
                uid: authUid,
                email: user.email,
                organizationId: organizatoinMember.organizationId,
            })
            return count
        } else {
            // 刪除別人的資料
            const authUid = await OrganizationMemberService.checkMemberAuths(
                String(user.email),
                String(organizatoinMember.organizationId),
                request.method
            )
            const count = await OrganizationMemberService.deleteMemberById({
                uid: authUid,
                id: organizatoinMember.id,
                organizationId: organizatoinMember.organizationId,
            })
            return count
        }
    })
    .get('/member/organization/list', async ({ bearer, params, query }) => {
        const { AuthService, OrganizationMemberService, } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const pagination = query as any
        const result = await OrganizationMemberService.getRelatedMembership(String(user.email), pagination)
        return result
    })
export default router