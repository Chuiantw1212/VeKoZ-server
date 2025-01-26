import AccessGlobalService from '../../entities/app'
import type { IOrganization } from '../../entities/organization';
import { Elysia, } from 'elysia'

const router = new Elysia()
import { bearer } from '@elysiajs/bearer'
router.use(bearer())
  .post('/organization', async ({ request, bearer, store }) => {
    // console.log({ bearer })
    // const idToken = request.headers.authorization || ''
    const { OrganizationService, AuthService } = AccessGlobalService.locals
    const user = await AuthService.verifyIdToken(bearer)
    const organization: IOrganization = request.body as any
    const newOrganization: IOrganization = OrganizationService.newItem(user.uid, organization)
    return newOrganization
  })

  /**
   * var nodeRequestToWebstand = (req, abortController) => {
    let _signal;
    console.log('debug', "content-type" in req.headers)
    const test = new Request(getUrl(req), {
      method: req.method,
      headers: req.headers,
      get body() {
        if (req.method === "GET" || req.method === "HEAD") return null;
        return import_stream2.Readable.toWeb(req);
      },
      get signal() {
        if (_signal) return _signal;
        const controller = abortController ?? new AbortController();
        _signal = controller.signal;
        req.once("close", () => {
          controller.abort();
        });
        return _signal;
      },
      // @ts-expect-error
      duplex: "content-type" in req.headers ? "half" : "half"
    });
    
    return test
  };
   */

  .put('/organization/logo', async () => {
    try {
      // const blob = request.body
      const { OrganizationService } = AccessGlobalService.locals
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