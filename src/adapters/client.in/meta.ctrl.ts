import AccessGlobalService from '../../entities/app'
import { Elysia, } from 'elysia'
const router = new Elysia()
router.get('/meta/select', async function () {
    try {
        const { MetaService } = AccessGlobalService.locals
        // const countiesAndTownMap = await MetaService.getTaiwanLocations()
        // const selectOptionsMap = await GetOptionsService.getOptionsMap()
        const result = {
            // ...countiesAndTownMap,
            // ...selectOptionsMap,
        }
        return result
    } catch (error: any) {
        console.trace(error)
        return error.message || error
    }
})
export default router