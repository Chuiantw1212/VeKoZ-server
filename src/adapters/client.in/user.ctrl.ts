import AccessGlobalService from '../../entities/app'
import { Elysia, } from 'elysia'
import { bearer } from '@elysiajs/bearer'
import { IUser } from '../../entities/user'
const router = new Elysia()
router.use(bearer())
    .get('/user', async ({ bearer }) => {
        const { AuthService, UserService } = AccessGlobalService.locals
        const userIdToken = await AuthService.verifyIdToken(bearer)
        const user = await UserService.getUser(userIdToken.uid)
        return user
    })
    .post('/user', async ({ bearer, request }) => {
        const { AuthService, UserService } = AccessGlobalService.locals
        const userIdToken = await AuthService.verifyIdToken(bearer)
        const user = await request.json() as IUser
        const userCreated = await UserService.addUser(userIdToken.uid, user)
        return userCreated
    })
    .patch('/user/preference', async ({ bearer, request }) => {
        const { AuthService, UserService } = AccessGlobalService.locals
        const userIdToken = await AuthService.verifyIdToken(bearer)
        const userPreference = await request.json()
        const count = await UserService.patchUserPreference(userIdToken.uid, userPreference)
        return count
    })
export default router