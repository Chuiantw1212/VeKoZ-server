import { Storage } from 'firebase-admin/storage'
import { IBlob } from '../ports/out.model'

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

    async writeImageByPath(path: string, image: IBlob): Promise<string> {
        if (image && typeof image === 'string') {
            throw "typeof image === 'string'"
        }
        const { type, buffer } = image
        const uuid = crypto.randomUUID()
        const blob = this.bucket.file(`${this.prefix}/${path}/${uuid}.${type}`)
        const blobStream = blob.createWriteStream({
            resumable: false,
        })
        const typedResult = Buffer.from(buffer)
        blobStream.end(typedResult)
        return blob.publicUrl()
    }

    /**
     * delete blob by path
     * @param path
     */
    async deleteBlobByPath(path: string) {
        try {
            const getFilesResponse = await this.bucket.getFiles({
                prefix: `${this.prefix}/${path}`,
            })
            const files = getFilesResponse[0]
            const promises = files.map(async (file) => {
                return file.delete()
            })
            await Promise.all(promises)
        } catch (error) {
            // 可能會因為沒資料可刪出錯
        }
    }
}