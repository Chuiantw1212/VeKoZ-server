import AccessGlobalService from '../../entities/app'
import type { IPlace } from '../../entities/place'
import { Elysia, } from 'elysia'
import { bearer } from '@elysiajs/bearer'
const router = new Elysia()
router.use(bearer())
    .get('/place/list', async () => {
        const { PlaceService } = AccessGlobalService.locals
        const result = await PlaceService.getPlaceList()
        return result
    })
    .post('/place', async ({ request, bearer }) => {
        const { AuthService, PlaceService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const place = await request.json() as IPlace
        const result = await PlaceService.addPlace(user.uid, place)
        return result
    })
    .put('/place/:id', async ({ request, bearer, params }) => {
        const { AuthService, PlaceService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const place = await request.json() as IPlace
        const { id } = params
        const result = await PlaceService.mergePlaceById(user.uid, id, place)
        return result
    })
    .delete('/place/:id', async ({ bearer, params }) => {
        const { id } = params
        const { AuthService, PlaceService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const result = await PlaceService.deletePlaceById(user.uid, id)
        return result
    })
export default router