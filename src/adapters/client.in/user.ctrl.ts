import AccessGlobalService from '../../entities/app'
import { Elysia, } from 'elysia'
import { bearer } from '@elysiajs/bearer'
import { DecodedIdToken } from 'firebase-admin/auth'
const router = new Elysia()
router.use(bearer())
    .get('/user', async ({ bearer }) => {
        const { AuthService, UserService } = AccessGlobalService.locals
        const userIdToken: DecodedIdToken = await AuthService.verifyIdToken(bearer)
        const user = await UserService.getUser(userIdToken.uid)
        return user
    })
export default router