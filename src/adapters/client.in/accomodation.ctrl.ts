import AccessGlobalService from '../../entities/app'
import { Elysia, } from 'elysia'
import { bearer } from '@elysiajs/bearer'
const router = new Elysia()
router.use(bearer())
    .post('/accomodation', async function ({ request, bearer }) {
        const { AuthService, AccomdationService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const result = await AccomdationService.newItem()
        // const countiesAndTownMap = await MetaService.getTaiwanLocations()
        // const selectOptionsMap = await GetOptionsService.getOptionsMap()
        const result = {
            // ...countiesAndTownMap,
            // ...selectOptionsMap,
        }
        return result
    })
export default router