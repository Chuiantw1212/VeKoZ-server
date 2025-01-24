import AccessGlobalService from '../../entities/app'
import { Elysia, } from 'elysia'
const router = new Elysia
router.get('/organization', async () => {
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
router.put('/organization/logo', async ({ request }) => {
    try {
        const blob = request.body
        const { OrganizationService } = AccessGlobalService.locals
        // const organization ＝OrganizationService.get
        // const id = 
        // OrganizationService.storeLogo(blob)

        return true
    } catch (error) {

    }
    // const idToken = request.headers.authorization || ''
    // const user = await fastify.firebase.verifyIdToken(idToken)
    // // Store Logo
    // const company = await CompanyModel.getByAdminUid(user.uid)
    // const publicUrl = await CompanyModel.storeLogo(company.id, blob)
    // company.logo = publicUrl
    // await CompanyModel.patchInfo(company)
    // await JobModel.updateOrganization(company)
    // res.code(200).send(publicUrl)
})
export default router