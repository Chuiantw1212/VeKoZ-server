import AccessGlobalService from '../../entities/app'
import { Elysia, } from 'elysia'
import { bearer } from '@elysiajs/bearer'
import { IUser, IUserDesign } from '../../entities/user'
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
    // 不帶參數，只使用ID Token抓自己的資料
    .get('/user', async ({ bearer }) => {
        const { AuthService, UserService } = AccessGlobalService.locals
        const userIdToken = await AuthService.verifyIdToken(bearer)
        const user = await UserService.getUserByUid(userIdToken.uid)
        return user
    })
    // 帶參數抓公開的使用者資料
    .get('/user/:seoName', async ({ params }) => {
        const { UserService } = AccessGlobalService.locals
        const { seoName } = params
        const user = await UserService.getUserBySeoName(seoName)
        return user
    })
    .patch('/user/seo-name', async ({ bearer, request }) => {
        const { AuthService, UserService } = AccessGlobalService.locals
        const userIdToken = await AuthService.verifyIdToken(bearer)
        const user = await request.json() as IUser
        const count = await UserService.setUserSeoName(userIdToken.uid, user)
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