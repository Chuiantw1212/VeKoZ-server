import AccessGlobalService from '../../entities/app'
import { Elysia, } from 'elysia'
import { bearer } from '@elysiajs/bearer'
import { IFollowAction } from '../../entities/followAction'
const router = new Elysia()
router.use(bearer())
    .get('/follow-action/', async function ({ query, request, bearer }) {
        const { EventService, AuthService, FollowService, } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const followAction = request.body as IFollowAction
        const result = FollowService.addNewFollow(user.uid, followAction)
        return result
    })
export default router