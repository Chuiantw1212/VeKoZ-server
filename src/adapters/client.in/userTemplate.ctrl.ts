import AccessGlobalService from '../../entities/app'
import { Elysia, } from 'elysia'
import { bearer } from '@elysiajs/bearer'
import { IUser } from '../../entities/user'
const router = new Elysia()
router.use(bearer())
    .get('/user/:userId/template', async ({ bearer }) => {
        const { AuthService, UserService } = AccessGlobalService.locals
        const userIdToken = await AuthService.verifyIdToken(bearer)
        // const user = await UserService.getUserByUid(userIdToken.uid)
        // return user
    })
export default router