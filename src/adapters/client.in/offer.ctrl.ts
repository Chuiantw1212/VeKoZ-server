import AccessGlobalService from '../../entities/app'
import type { IPlace } from '../../entities/place'
import { Elysia, } from 'elysia'
import { bearer } from '@elysiajs/bearer'
import { IOffer, IOfferQuery } from '../../entities/offer'
const router = new Elysia()
router.use(bearer())
    .get('/offer/list', async ({ bearer, query }) => {
        const { AuthService, OfferService, OrganizationMemberService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const offerQuery = query as IOfferQuery
        // const impersonatedMember = await OrganizationMemberService.getMemberByQuery({
        //     email: String(user.email),
        //     organizationId: String(eventTemplate.organizerId),
        //     allowMethods: [request.method]
        // })
        const offerList: IOffer[] = await OfferService.queryOfferList(offerQuery)
        return offerList
    })
    .patch('/offer/category/:categoryId', async ({ request, bearer, params }) => {
        const { AuthService, OfferService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const { categoryId } = params
        const offer = await request.json() as IOffer
        const count = await OfferService.setOffersByCategoryId(user.uid, categoryId, offer)
        return count
    })
    .patch('/offer/:offerId', async ({ request, bearer, params }) => {
        const { AuthService, OfferService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const { offerId } = params
        const offer = await request.json() as IOffer
        const count = await OfferService.setOfferById(user.uid, offerId, offer)
        return count
    })
export default router