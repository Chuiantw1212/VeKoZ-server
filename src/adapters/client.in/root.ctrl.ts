/**
 * https://elysiajs.com/key-concept.html#everything-is-a-component
 */
import { memoryUsage } from 'node:process'
import AccessGlobalService from '../../entities/app'
import { Elysia, } from 'elysia'
const router = new Elysia()
router.get('/', async () => {
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
export default router