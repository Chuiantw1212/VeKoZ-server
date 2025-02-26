/**
 * 如果是本地就要運行gcloud auth application-default login來指派ADC
 * https://cloud.google.com/docs/authentication/provide-credentials-adc
 */
import type { storage_v1 } from "googleapis"
import { google } from 'googleapis'

export class GoogleStoragePlugin {
    private storage_v1: storage_v1.Storage = null as any
    async setClient(apiKey: string) {
        if (!apiKey) {
            throw 'apiKey沒有提供'
        }
        this.storage_v1 = google.storage({
            version: 'v1',
            auth: apiKey
        })
    }
    // async getPublicBucket() {
    //     const options: storage_v1.Params$Resource$Buckets$List = {
    //         project: 'votion-d92bc'
    //     }
    //     const googleBucket = await this.storage_v1.buckets.list(options)
    //     return googleBucket
    // }
}
export default new GoogleStoragePlugin()