import AccessGlobalService from '../../entities/app'
import { Elysia, } from 'elysia'
import { bearer } from '@elysiajs/bearer'
import { IUserFollow, IUserFollowQuery } from '../../entities/userFollow'
const router = new Elysia()
router.use(bearer())
    .get('/user/follow', async function ({ query, bearer }) {
        const { AuthService, FollowService, } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const followQuery = query as IUserFollowQuery
        followQuery.uid = user.uid
        const count = await FollowService.checkFollowed(followQuery)
        return count
    })
    .post('/user/follow', async function ({ request, bearer }) {
        const { AuthService, FollowService, } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const userFollow = await request.json() as IUserFollow
        const result = await FollowService.addNewFollow(user.uid, userFollow)
        return result
    })
export default router