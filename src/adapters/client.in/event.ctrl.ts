import AccessGlobalService from '../../entities/app'
import { Elysia, } from 'elysia'
import { bearer } from '@elysiajs/bearer'
const router = new Elysia()
router.use(bearer())
    .post('/event', async function () {
        const { MetaService } = AccessGlobalService.locals
        // const countiesAndTownMap = await MetaService.getTaiwanLocations()
        // const selectOptionsMap = await GetOptionsService.getOptionsMap()
        const result = {
            // ...countiesAndTownMap,
            // ...selectOptionsMap,
        }
        return result
    })
    .get('/event/template', async function ({ request, bearer }) {
        const { EventService, AuthService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const eventTemplate = await EventService.getItem(user.uid)
        return eventTemplate
    })
    .put('/event/template', async function ({ request, bearer }) {
        const { EventService, AuthService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const eventTemplate = await request.json() as any
        const result = EventService.putTemplate(user.uid, eventTemplate)
        return result
    })
export default router