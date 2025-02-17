import AccessGlobalService from '../../entities/app'
import { Elysia, } from 'elysia'
const router = new Elysia()
    .get('/meta/select/:id', async function ({ params }) {
        try {
            const { MetaService } = AccessGlobalService.locals
            const { id } = params
            const options = await MetaService.getOptionsById(id)
            return options
        } catch (error: any) {
            console.trace(error)
            return error.message || error
        }
    })
    .get('/meta/select/map', async function () {
        try {
            const { MetaService } = AccessGlobalService.locals
            const selectMap = await MetaService.getOptionsMap()
            return selectMap
        } catch (error: any) {
            console.trace(error)
            return error.message || error
        }
    })
export default router