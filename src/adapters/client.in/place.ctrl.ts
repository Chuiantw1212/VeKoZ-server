import AccessGlobalService from '../../entities/app'
import type { IPlace, IPlaceQuery } from '../../entities/place'
import { Elysia, } from 'elysia'
import { bearer } from '@elysiajs/bearer'
const router = new Elysia()
router.use(bearer())
    .get('/place/list', async ({ bearer, query, request }) => {
        const { PlaceService, AuthService, OrganizationMemberService } = AccessGlobalService.locals
        // const user = await AuthService.verifyIdToken(bearer)
        const placeQuery = query as IPlaceQuery
        // if (placeQuery.organizationId&&) {

        // }
        // const impersonatedMember = await OrganizationMemberService.getMemberByQuery({
        //     email: String(user.email),
        //     organizationId: String(placeQuery.organizationId),
        //     allowMethods: [request.method]
        // })
        const result = await PlaceService.getPlaceList(placeQuery)
        return result
    })
    .post('/place', async ({ request, bearer }) => {
        const { AuthService, PlaceService, OrganizationMemberService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const place = await request.json() as IPlace
        const impersonatedMember = await OrganizationMemberService.getMemberByQuery({
            email: String(user.email),
            organizationId: String(place.organizationId),
            allowMethods: [request.method]
        })
        const result = await PlaceService.addPlace(String(impersonatedMember.uid), place)
        return result
    })
    .patch('/place', async ({ request, bearer }) => {
        const { AuthService, PlaceService, OrganizationMemberService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const place = await request.json() as IPlace
        const impersonatedMember = await OrganizationMemberService.getMemberByQuery({
            email: String(user.email),
            organizationId: String(place.organizationId),
            allowMethods: [request.method]
        })
        const result = await PlaceService.mergePlaceById(String(impersonatedMember.uid), String(place.id), place)
        return result
    })
    .delete('/place', async ({ bearer, query, request }) => {
        const { AuthService, PlaceService, OrganizationMemberService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const placeQuery = query as IPlaceQuery
        const impersonatedMember = await OrganizationMemberService.getMemberByQuery({
            email: String(user.email),
            organizationId: String(placeQuery.organizationId),
            allowMethods: [request.method]
        })
        const result = await PlaceService.deletePlaceById(String(impersonatedMember.uid), String(placeQuery.id))
        return result
    })
export default router