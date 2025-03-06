import AccessGlobalService from '../../entities/app'
import { Elysia, } from 'elysia'
import { bearer } from '@elysiajs/bearer'
import { IUser } from '../../entities/user'
import { IBlob } from '../../ports/out.model'
import { DecodedIdToken } from 'firebase-admin/auth'
interface DecodedIdTokenWithName extends DecodedIdToken {
    name?: string,
}
const router = new Elysia()
router.use(bearer())
    .post('/user', async ({ bearer, }) => {
        const { AuthService, UserService, OrganizationService, OrganizationMemberService } = AccessGlobalService.locals
        const userIdToken: DecodedIdTokenWithName = await AuthService.verifyIdToken(bearer)
        const userCreated = await UserService.addUser(userIdToken)
        // 建立自己的預設組織
        OrganizationService.newItem(userIdToken.uid, {
            name: `${userCreated.name}的第一個組織`,
            email: userIdToken.email,
            founderEmail: userIdToken.email,
        }).then(async (newOrganization) => {
            // 只能從這邊跳過增加成員的權限認定
            OrganizationMemberService.directAddHost(userIdToken.uid, {
                name: userIdToken.name ?? '',
                email: userIdToken.email ?? '',
                organizationId: String(newOrganization.id),
                organizationName: newOrganization.name,
                organizationFounderEmail: newOrganization.founderEmail,
                allowMethods: ['GET', 'PATCH', 'POST', 'DELETE'],
            })
        })
        // 更新受邀請組織的資料
        if (userCreated.name && userCreated.email) {
            OrganizationMemberService.joinRelatedOrganization({
                name: userCreated.name,
                email: userCreated.email,
                allowMethods: ['GET'],
            })
        }
        return userCreated
    })
    .patch('/user', async ({ bearer, request }) => {
        const { AuthService, UserService } = AccessGlobalService.locals
        const userIdToken = await AuthService.verifyIdToken(bearer)
        const user = await request.json() as IUser
        const count = await UserService.setUser(userIdToken.uid, user)
        return count
    })
    .put('/user/avatar', async ({ bearer, request }) => {
        const { AuthService, UserService } = AccessGlobalService.locals
        const userIdToken = await AuthService.verifyIdToken(bearer)
        const avatar = await request.json() as IBlob
        const count = await UserService.uploadUserAvatar(userIdToken.uid, avatar)
        return count
    })
    // 不帶參數，只使用ID Token抓自己的資料
    .get('/user', async ({ bearer }) => {
        const { AuthService, UserService } = AccessGlobalService.locals
        const userIdToken = await AuthService.verifyIdToken(bearer)
        const user = await UserService.getUserByUid(userIdToken.uid)
        return user
    })
    /**
     * 因主辦事件關聯產生的公開資料抓取，不可隱藏
     */
    .get('/user/:userId', async ({ params }) => {
        const { UserService } = AccessGlobalService.locals
        const { userId } = params
        const user = await UserService.getUserPublicInfo('id', userId)
        return user
    })
    /**
     * 造訪用戶個人頁，可隱藏
     */
    .get('/user/seo/:seoName', async ({ params }) => {
        const { UserService } = AccessGlobalService.locals
        const { seoName } = params
        const user = await UserService.getUserPublicInfo('seoName', seoName)
        return user
    })
    .patch('/user/seo', async ({ bearer, request }) => {
        const { AuthService, UserService } = AccessGlobalService.locals
        const userIdToken = await AuthService.verifyIdToken(bearer)
        const user = await request.json() as IUser
        const count = await UserService.setUserSeo(userIdToken.uid, user)
        return count
    })
    .patch('/user/preference', async ({ bearer, request }) => {
        const { AuthService, UserService } = AccessGlobalService.locals
        const userIdToken = await AuthService.verifyIdToken(bearer)
        const userPreference = await request.json()
        const count = await UserService.patchUserPreference(userIdToken.uid, userPreference)
        return count
    })
export default router