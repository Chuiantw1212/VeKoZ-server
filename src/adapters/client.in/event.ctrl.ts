import AccessGlobalService from '../../entities/app'
import { Elysia, } from 'elysia'
const router = new Elysia
router.post('/event', async function () {
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

router.get('/event/template', async function ({ request }) {
    try {
        const { EventService } = AccessGlobalService.locals
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

router.put('/event/template', async function ({ request }) {
    try {
        const requestBody = await request.json()
        const { EventService } = AccessGlobalService.locals
        EventService.putTemplate(requestBody)
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