import AccessGlobalService from '../../entities/app'
import { Elysia, } from 'elysia'
import { bearer } from '@elysiajs/bearer'
import { IUser, IUserDesign } from '../../entities/user'
const router = new Elysia()
router.use(bearer())
    .post('/use-design/list', async ({ bearer, request }) => {
        const { AuthService, UserService } = AccessGlobalService.locals
        const userIdToken = await AuthService.verifyIdToken(bearer)
        const userDesigns = await request.json() as IUserDesign[]
        const userCreated = await UserService.addUserDesigns(userIdToken.uid, userDesigns)
        return userCreated
    })
    .get('/user-design/:templateId', async ({ bearer }) => {
        const { AuthService, UserService } = AccessGlobalService.locals
        const userIdToken = await AuthService.verifyIdToken(bearer)
        // const user = await UserService.getUserByUid(userIdToken.uid)
        // return user
    })
    .patch('/user-design/:designId', async ({ bearer, request }) => {
        const { AuthService, UserService, UserDesignService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const userDesign = await request.json() as IUserDesign
        const userPatch = await UserDesignService.patchUserDesign(user.uid, userDesign)
        return userPatch
    })
export default router