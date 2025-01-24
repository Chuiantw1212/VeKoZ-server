import { memoryUsage } from 'node:process'
import AccessGlobalService from '../../entities/app'
import { Elysia, } from 'elysia'
const router = new Elysia
router.post('/organization', async () => {
    console.log('post')
    //     const memoryUsageInMB: ReturnType<typeof memoryUsage> = {
    //         rss: 0,
    //         heapTotal: 0,
    //         heapUsed: 0,
    //         arrayBuffers: 0,
    //         external: 0,
    //     }
    //     const currentMemoryUsage: any = memoryUsage()
    //     for (const key in memoryUsageInMB) {
    //         const mb: number = Math.floor(1024 * 1024)
    //         const value: number = currentMemoryUsage[key]
    //         const valueInMB: number = Math.floor(value / mb)
    //         Object.assign(memoryUsageInMB, {
    //             [key]: `${valueInMB.toLocaleString()}Mb`
    //         })
    //     }
    //     return {
    //         memoryUsage: memoryUsageInMB,
    //         startupTime: AccessGlobalService.get('startupTime'),
    //     }
})
router.get('/organization', async () => {
    const memoryUsageInMB: ReturnType<typeof memoryUsage> = {
        rss: 0,
        heapTotal: 0,
        heapUsed: 0,
        arrayBuffers: 0,
        external: 0,
    }
    const currentMemoryUsage: any = memoryUsage()
    for (const key in memoryUsageInMB) {
        const mb: number = Math.floor(1024 * 1024)
        const value: number = currentMemoryUsage[key]
        const valueInMB: number = Math.floor(value / mb)
        Object.assign(memoryUsageInMB, {
            [key]: `${valueInMB.toLocaleString()}Mb`
        })
    }
    return {
        memoryUsage: memoryUsageInMB,
        startupTime: AccessGlobalService.get('startupTime'),
    }
})
router.put('/organization/logo', async () => {
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