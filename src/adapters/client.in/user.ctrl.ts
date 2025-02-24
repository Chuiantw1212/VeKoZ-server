import AccessGlobalService from '../../entities/app'
import { Elysia, } from 'elysia'
import { bearer } from '@elysiajs/bearer'
import { IUser } from '../../entities/user'
const router = new Elysia()
router.use(bearer())
    .get('/user', async ({ bearer }) => {
        const { AuthService, UserService } = AccessGlobalService.locals
        const userIdToken = await AuthService.verifyIdToken(bearer)
        const user = await UserService.getUserByUid(userIdToken.uid)
        return user
    })
    .get('/user/:seoName', async ({ params }) => {
        const { UserService } = AccessGlobalService.locals
        const { seoName } = params
        const user = await UserService.getUserBySeoName(seoName)
        return user
    })
    .post('/user', async ({ bearer, request }) => {
        const { AuthService, UserService } = AccessGlobalService.locals
        const userIdToken = await AuthService.verifyIdToken(bearer)
        const user = await request.json() as IUser
        const userCreated = await UserService.addUser(userIdToken.uid, user)
        return userCreated
    })
    .patch('/user/:id', async ({ bearer, request }) => {
        const { AuthService, UserService } = AccessGlobalService.locals
        const userIdToken = await AuthService.verifyIdToken(bearer)
        const user = await request.json() as IUser
        const count = await UserService.setUser(userIdToken.uid, user)
        return count
    })
    .patch('/user/:id/seo-name', async ({ bearer, request }) => {
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