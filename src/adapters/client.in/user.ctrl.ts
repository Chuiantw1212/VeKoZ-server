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
        const { AuthService, UserService, OrganizationService, OrganizationMemberService, EventTemplateService } = AccessGlobalService.locals
        const userIdToken: DecodedIdTokenWithName = await AuthService.verifyIdToken(bearer)
        const userCreated = await UserService.addUser(userIdToken)
        // 建立自己的預設組織
        OrganizationService.newItem(userIdToken.uid, {
            id: userCreated.id, // important
            name: userIdToken.name ?? '',
            email: userIdToken.email,
            organizationName: `${userCreated.name}的第一個組織`,
            isFounder: true, // 最高權限
            allowEntities: ['organizationMember'], // 次高權限
            allowMethods: ['GET', 'PATCH', 'POST', 'DELETE'],
        }).then(async newOrg => {
            // 建立第一個事件模板
            const newTemplate = await EventTemplateService.addEventTemplate(userIdToken.uid, {
                name: `${userCreated.name}的第一個模板`,
                organizerId: newOrg.id
            })
            // 更新偏好
            UserService.patchUserPreference(userIdToken.uid, {
                eventTemplate: {
                    organizerId: String(newOrg.id),
                    templateId: String(newTemplate.id)
                }
            })
        })

        // 更新受邀請組織的資料
        if (userCreated.name && userCreated.email) {
            OrganizationMemberService.joinRelatedOrganization({
                name: userCreated.name,
                email: userCreated.email,
                allowMethods: ['GET'],
                // 其他權限不異動
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
    .get('/user', async ({ request, bearer }) => {
        const { AuthService, UserService } = AccessGlobalService.locals
        const userIdToken = await AuthService.verifyIdToken(bearer)
        const user = await UserService.getUserByUid(userIdToken.uid)
        return user
    })
    /**
     * 造訪用戶個人頁，可隱藏
     */
    .get('/user/:userId', async ({ params }) => {
        const { UserService } = AccessGlobalService.locals
        const { userId } = params
        const user = await UserService.getUserPublicInfoById(userId)
        return user
    })
    .get('/user/seo/:seoName', async ({ params }) => {
        const { UserService } = AccessGlobalService.locals
        const { seoName } = params
        const user = await UserService.getUserPublicInfoBySeoName(seoName)
        if (user) {
            return user
        } else {
            const user = await UserService.getUserPublicInfoById(seoName)
            return user
        }
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