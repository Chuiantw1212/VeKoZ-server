import AccessGlobalService from '../../entities/app'
import type { IOrganization } from '../../entities/organization'
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
    if (logo && typeof organization.logo !== 'string') {
      const publicUrl: string = await OrganizationService.storeLogo(organization.id, logo)
      organization.logo = publicUrl
    }
    newOrganization = await OrganizationService.mergeUniqueDoc(user.uid, organization)
    return newOrganization
  })
  .put('/organization', async ({ request, bearer }) => {
    const { OrganizationService, AuthService } = AccessGlobalService.locals
    const user = await AuthService.verifyIdToken(bearer)
    const organization: IOrganization = await OrganizationService.getItem(user.uid)
    let newOrganization: IOrganization = await request.json() as any
    Object.assign(organization, {
      ...newOrganization
    })
    if (typeof organization.logo !== 'string') {
      const publicUrl: string = await OrganizationService.storeLogo(organization.id, organization.logo)
      organization.logo = publicUrl
    }
    newOrganization = await OrganizationService.mergeUniqueDoc(user.uid, organization)
    return newOrganization
  })
  .delete('/organization', async ({ bearer }) => {
    // TODO: 新增的管理者也可以刪除組織嗎？
    const { OrganizationService, AuthService } = AccessGlobalService.locals
    const user = await AuthService.verifyIdToken(bearer)
    const organization: IOrganization = await OrganizationService.getItem(user.uid)
    const isSuccess = await OrganizationService.deleteItem(organization.id)
    return isSuccess
  })
export default router