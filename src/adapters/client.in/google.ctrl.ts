import AccessGlobalService from '../../entities/app'
import type { IPlace } from '../../entities/place'
import { Elysia, } from 'elysia'
import { bearer } from '@elysiajs/bearer'
const router = new Elysia()
router.use(bearer())
    .get('/google/calendar/event/list', async ({ bearer, query, }) => {
        /**
         * https://elysiajs.com/essential/route.html#wildcards
         */
        const { GoogleService, AuthService } = AccessGlobalService.locals
        const user = await AuthService.verifyIdToken(bearer)
        const result = await GoogleService.getGoogleCalendarEventList(user.uid, query)
        return result
    })
export default router