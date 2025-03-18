import AccessGlobalService from '../../entities/app'
import { Elysia, } from 'elysia'
import { bearer } from '@elysiajs/bearer'
import { IUserFollow } from '../../entities/userFollow'
const router = new Elysia()
router.use(bearer())
    .post('/user/follow', async function ({ request, bearer }) {
        const { AuthService, FollowService, } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const userFollow = await request.json() as IUserFollow
        const result = await FollowService.addNewFollow(user.uid, userFollow)
        return result
    })
export default router