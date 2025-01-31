import AccessGlobalService from '../../entities/app'
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
        // const { AuthService, AccomdationService } = AccessGlobalService.locals
        // const user = await AuthService.verifyIdToken(bearer)
        // const result = await AccomdationService.newItem()
        // const countiesAndTownMap = await MetaService.getTaiwanLocations()
        // const selectOptionsMap = await GetOptionsService.getOptionsMap()
        // const result = {
            // ...countiesAndTownMap,
            // ...selectOptionsMap,
        // }
        // return result
    })
export default router