import AccessGlobalService from '../../entities/app'
import { Elysia, } from 'elysia'
import { bearer } from '@elysiajs/bearer'
import { IUser, IUserDesign } from '../../entities/user'
import { IBlob } from '../../ports/out.model'
const router = new Elysia()
router.use(bearer())
    .post('/user', async ({ bearer, request }) => {
        const { AuthService, UserService } = AccessGlobalService.locals
        const userIdToken = await AuthService.verifyIdToken(bearer)
        const user = await request.json() as IUser
        const userCreated = await UserService.addUser(userIdToken.uid, user)
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
    // 帶參數抓公開的使用者資料
    .get('/user/:userId', async ({ params }) => {
        const { UserService } = AccessGlobalService.locals
        const { userId } = params
        const user = await UserService.getUserPublicInfo('id', userId)
        return user
    })
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