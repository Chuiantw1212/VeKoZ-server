import { Storage } from 'firebase-admin/storage'

// interface IBlobAdapter {
//     prefix: string,
//     bucket: ReturnType<Storage['bucket']>
// }

export default class BlobAdapter {
    private prefix: string
    private bucket: ReturnType<Storage['bucket']>

    constructor(prefix: string, bucket: ReturnType<Storage['bucket']>) {
        this.prefix = prefix
        this.bucket = bucket
    }
}