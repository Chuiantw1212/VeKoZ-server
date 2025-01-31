import AccessGlobalService from '../../entities/app'
import type { IAccommodation } from '../../entities/accommodation'
import { Elysia, } from 'elysia'
import { bearer } from '@elysiajs/bearer'
const router = new Elysia()
router.use(bearer())
    .get('/accommodation/list', async ({ request, bearer }) => {
        const { AuthService, AccomdationService } = AccessGlobalService.locals
        const result = await AccomdationService.getList()
        return result
    })
    .post('/accommodation', async ({ request, bearer }) => {
        const { AuthService, AccomdationService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const accommodation: IAccommodation = await request.json() as any
        const result = await AccomdationService.newItem(user.uid, accommodation)
        return result
    })
    .delete('/accommodation/:id', async ({ request, bearer, params }) => {
        const { id } = params
        const { AuthService, AccomdationService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const result = await AccomdationService.deleteItem()
        // const accommodation: IAccommodation = await request.json() as any
        // const result = await AccomdationService.newItem(user.uid, accommodation)
        return result
    })
export default router