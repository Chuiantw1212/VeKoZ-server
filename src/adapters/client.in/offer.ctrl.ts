import AccessGlobalService from '../../entities/app'
import type { IPlace } from '../../entities/place'
import { Elysia, } from 'elysia'
import { bearer } from '@elysiajs/bearer'
import { IOffer } from '../../entities/offer'
const router = new Elysia()
router.use(bearer())
    .get('/offer/list', async ({ bearer }) => {
        const { AuthService, OfferService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const offerList: IOffer[] = await OfferService.queryOfferList(user.uid)
        return offerList
    })
export default router