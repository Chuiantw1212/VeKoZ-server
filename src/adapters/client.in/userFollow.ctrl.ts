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
    .get('/user/follow/list', async function ({ query, bearer }) {
        const { AuthService, FollowService, } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const followQuery = query as IUserFollowQuery
        followQuery.uid = user.uid
        const count = await FollowService.getFollowList(followQuery)
        return count
    })
    .post('/user/follow', async function ({ request, bearer }) {
        const { AuthService, FollowService, } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const userFollow = await request.json() as IUserFollow
        const result = await FollowService.addNewFollow(user.uid, userFollow)
        return result
    })
    .patch('/user/follow', async function ({ request, bearer }) {
        const { AuthService, FollowService, } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const userFollow = await request.json() as IUserFollow
        userFollow.uid = user.uid
        const result = await FollowService.patchUserFollow(user.uid, userFollow)
        return result
    })
    .delete('/user/follow', async function ({ query, bearer }) {
        const { AuthService, FollowService, } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const followQuery = query as IUserFollowQuery
        followQuery.uid = user.uid
        const count = await FollowService.deleteUserFollow(followQuery)
        return count
    })
export default router