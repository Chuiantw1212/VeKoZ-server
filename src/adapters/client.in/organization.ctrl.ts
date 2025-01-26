import AccessGlobalService from '../../entities/app'
import type { IOrganization } from '../../entities/organization';
import { Elysia, } from 'elysia'
import { bearer } from '@elysiajs/bearer'
const router = new Elysia()
router.use(bearer())
  .get('/organization/list', async () => {
    const { OrganizationService, } = AccessGlobalService.locals
    const organizations: IOrganization[] = await OrganizationService.getList()
    return organizations
  })
  .post('/organization', async ({ request, bearer }) => {
    const { OrganizationService, AuthService } = AccessGlobalService.locals
    const user = await AuthService.verifyIdToken(bearer)
    const organization: IOrganization = await request.json() as any
    if (organization.logo) {

    }
    const newOrganization: IOrganization = OrganizationService.newItem(user.uid, organization)
    return newOrganization
  })
  .put('/organization/logo', async ({ request, bearer }) => {
    try {
      const { OrganizationService, AuthService } = AccessGlobalService.locals
      const user = await AuthService.verifyIdToken(bearer)
      const organization: IOrganization = await request.json() as any
      if (organization.logo) {
        const company = await OrganizationService.getByAdminUid(user.uid)
        const publicUrl = await OrganizationService.storeLogo(company.id, blob)
      }
      // const blob = request.body
      // OrganizationService.storeLogo()

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