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
    const logo = organization.logo
    organization.logo = ''
    let newOrganization: IOrganization = OrganizationService.newItem(user.uid, organization)
    if (logo) {
      const publicUrl: string = await OrganizationService.storeLogo(organization.id, organization.logo)
      organization.logo = publicUrl
    }
    newOrganization = await OrganizationService.mergeSingleDoc(user.uid, organization)
    return newOrganization
  })
  .put('/organization', async ({ request, bearer }) => {
    const { OrganizationService, AuthService } = AccessGlobalService.locals
    const user = await AuthService.verifyIdToken(bearer)
    const organization: IOrganization = await OrganizationService.getItem(user.uid)
    console.log({
      organization
    })
    let newOrganization: IOrganization = await request.json() as any
    Object.assign(organization, {
      ...newOrganization
    })
    if (typeof organization.logo !== 'string') {
      const publicUrl: string = await OrganizationService.storeLogo(organization.id, organization.logo)
      organization.logo = publicUrl
    }
    newOrganization = await OrganizationService.mergeSingleDoc(user.uid, organization)
    return newOrganization
  })
export default router