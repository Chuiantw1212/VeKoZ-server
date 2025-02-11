import AccessGlobalService from '../../entities/app'
import { Elysia, } from 'elysia'
import { bearer } from '@elysiajs/bearer'
const router = new Elysia()
router.use(bearer())
    .get('/user', async ({ bearer }) => {
        const { AuthService, PlaceService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        // const result = await PlaceService.getPlaceList()
        return {}
    })
export default router