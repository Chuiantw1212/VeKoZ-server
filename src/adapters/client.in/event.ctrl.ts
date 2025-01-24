import AccessGlobalService from '../../entities/app'
import { Elysia, } from 'elysia'
const router = new Elysia
router.post('/event', async function () {
    const { MetaService } = AccessGlobalService.locals
    // const countiesAndTownMap = await MetaService.getTaiwanLocations()
    // const selectOptionsMap = await GetOptionsService.getOptionsMap()
    const result = {
        // ...countiesAndTownMap,
        // ...selectOptionsMap,
    }
    return result
})

router.get('/event/template', async function ({ request }) {
    const { EventService } = AccessGlobalService.locals
    // const countiesAndTownMap = await MetaService.getTaiwanLocations()
    // const selectOptionsMap = await GetOptionsService.getOptionsMap()
    const result = {
        // ...countiesAndTownMap,
        // ...selectOptionsMap,
    }
    return result
})

router.put('/event/template', async function ({ request }) {

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
})
export default router