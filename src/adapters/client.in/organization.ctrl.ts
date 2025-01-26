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
  .put('/organization', async ({ request, bearer }) => {
    const { OrganizationService, AuthService } = AccessGlobalService.locals
    const user = await AuthService.verifyIdToken(bearer)
    const organization: IOrganization = await request.json() as any
    if (organization.logo) {
      const publicUrl: string = await OrganizationService.storeLogo(organization.id, organization.logo)
      organization.logo = publicUrl
    }
    const newOrganization: IOrganization = await OrganizationService.setItem(user.uid, organization)
    return newOrganization
  })
export default router