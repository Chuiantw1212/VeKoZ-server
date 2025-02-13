import AccessGlobalService from '../../entities/app'
import type { IPlace } from '../../entities/place'
import { Elysia, } from 'elysia'
import { bearer } from '@elysiajs/bearer'
const router = new Elysia()
router.use(bearer())
    .get('/google/calendar/event/list', async () => {
        const { GoogleService } = AccessGlobalService.locals
        // const result = await GoogleService.getGoogleCalendarEventList()
        // return result
    })
export default router