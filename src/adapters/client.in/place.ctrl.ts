import AccessGlobalService from '../../entities/app'
import type { IPlace } from '../../entities/place'
import { Elysia, } from 'elysia'
import { bearer } from '@elysiajs/bearer'
const router = new Elysia()
router.use(bearer())
    .get('/place/list', async ({ request, bearer }) => {
        const { AuthService, AccomdationService } = AccessGlobalService.locals
        const result = await AccomdationService.getDocList()
        return result
    })
    .post('/place', async ({ request, bearer }) => {
        const { AuthService, AccomdationService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const place: IPlace = await request.json() as any
        const result = await AccomdationService.newItem(user.uid, place)
        return result
    })
    .put('/place/:id', async ({ request, bearer, params }) => {
        const { id } = params
        const { AuthService, AccomdationService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const place: IPlace = await request.json() as any
        const result = await AccomdationService.mergeByDocId(user.uid, id, place)
        return result
    })
    .delete('/place/:id', async ({ request, bearer, params }) => {
        const { id } = params
        const { AuthService, AccomdationService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const result = await AccomdationService.deleteItemById(user.uid, id)
        return result
    })
export default router