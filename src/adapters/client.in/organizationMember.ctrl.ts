import AccessGlobalService from '../../entities/app'
import type { IOrganizationMember, IOrganizationMemberQuery } from '../../entities/organization'
import { Elysia, } from 'elysia'
import { bearer } from '@elysiajs/bearer'
import { IPagination } from '../../entities/meta'

const router = new Elysia()
router.use(bearer())
    .get('/organization/member/list/:organizationId', async ({ bearer, params, query, request }) => {
        const { AuthService, OrganizationMemberService, } = AccessGlobalService.locals
        const { organizationId } = params
        const user = await AuthService.verifyIdToken(bearer)
        const impersonatedMember = await OrganizationMemberService.getMemberByQuery({
            email: String(user.email),
            organizationId: String(organizationId),
            allowMethods: [request.method]
        })
        const pagination = query as IPagination
        const result = await OrganizationMemberService.getMemberList({
            uid: impersonatedMember.uid,
            organizationId,
            email: user.email,
        }, pagination)
        return result
    })
    .get('/organization/member/:organizationId', async ({ bearer, params, query, request }) => {
        const { AuthService, OrganizationMemberService, } = AccessGlobalService.locals
        const { organizationId } = params
        const user = await AuthService.verifyIdToken(bearer)
        const impersonatedMember = await OrganizationMemberService.getMemberByQuery({
            email: String(user.email),
            organizationId: String(organizationId),
            allowMethods: [request.method]
        })
        delete impersonatedMember.uid
        return impersonatedMember
    })
    .post('/organization/member', async ({ bearer, request, }) => {
        /**
         * 要補上權限認定
         */
        const { AuthService, OrganizationMemberService, } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const organizatoinMember = await request.json() as IOrganizationMember
        const impersonatedMember = await OrganizationMemberService.getMemberByQuery({
            email: String(user.email),
            organizationId: String(organizatoinMember.organizationId),
            allowEntities: ['organizationMember'],
        })
        const newMember = await OrganizationMemberService.inviteMember(String(impersonatedMember.uid), organizatoinMember)
        return newMember
    })
    .patch('/organization/member', async ({ bearer, request, }) => {
        const { AuthService, OrganizationMemberService, } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const organizatoinMember = await request.json() as IOrganizationMember
        const impersonatedMember = await OrganizationMemberService.getMemberByQuery({
            email: String(user.email),
            organizationId: String(organizatoinMember.organizationId),
            allowEntities: ['organizationMember'],
        })
        const count = await OrganizationMemberService.setMemberById(String(impersonatedMember.uid), organizatoinMember)
        return count
    })
    .patch('/organization/member/calendar-color', async ({ bearer, request, }) => {
        const { AuthService, OrganizationMemberService, } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const organizatoinMember = await request.json() as IOrganizationMember
        /**
         * 例外處理月曆顏色，讓每個人都可以改自己的顏色
         */
        const impersonatedMember = await OrganizationMemberService.getMemberByQuery({
            email: String(user.email),
            organizationId: String(organizatoinMember.organizationId),
            allowMethods: ['GET'],
        })
        const count = await OrganizationMemberService.setMemberById(String(impersonatedMember.uid), {
            id: organizatoinMember.id,
            calendarColor: organizatoinMember.calendarColor,
        })
        return count
    })
    .delete('/organization/member', async ({ bearer, request, }) => {
        const { AuthService, OrganizationMemberService, } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const organizatoinMember = await request.json() as IOrganizationMember
        if (user.email === organizatoinMember.email) {
            // 刪除的是自己的資料
            const impersonatedMember = await OrganizationMemberService.getMemberByQuery({
                email: String(user.email),
                organizationId: String(organizatoinMember.organizationId),
                allowMethods: ['GET'],
            })
            const count = await OrganizationMemberService.deleteSelfByEmail({
                uid: impersonatedMember.uid,
                email: user.email,
                organizationId: organizatoinMember.organizationId,
            })
            return count
        } else {
            // 刪除別人的資料
            const impersonatedMember = await OrganizationMemberService.getMemberByQuery({
                email: String(user.email),
                organizationId: String(organizatoinMember.organizationId),
                allowEntities: ['organizationMember'],
            })
            const count = await OrganizationMemberService.deleteMemberById({
                uid: impersonatedMember.uid,
                id: organizatoinMember.id,
                organizationId: organizatoinMember.organizationId,
            })
            return count
        }
    })
    .get('/member/organization/list', async ({ bearer, query }) => {
        const { AuthService, OrganizationMemberService, } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const memberQuery = query as IOrganizationMemberQuery
        const result = await OrganizationMemberService.getRelatedMembership(String(user.email), memberQuery)
        return result
    })
export default router