import AccessGlobalService from '../../entities/app'
import { Elysia, } from 'elysia'
import { bearer } from '@elysiajs/bearer'
import { IUser, IUserDesign } from '../../entities/user'
const router = new Elysia()
router.use(bearer())
    .get('/userDesign/:templateId', async ({ bearer }) => {
        const { AuthService, UserService } = AccessGlobalService.locals
        const userIdToken = await AuthService.verifyIdToken(bearer)
        // const user = await UserService.getUserByUid(userIdToken.uid)
        // return user
    })
    .patch('/userDesign/:designId', async ({ bearer, request }) => {
        const { AuthService, UserService, UserDesignService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const userDesign = await request.json() as IUserDesign
        const count = await UserDesignService.patchUserDesign(user.uid, userDesign)
        return count
    })
export default router