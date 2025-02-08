import Firestore from '../adapters/Firestore.out'
import type { IFirestoreAdapters } from '../entities/dataAccess'
interface ILogo {
    type: string;
    buffer: Buffer,
}

export default class OrganizationModel extends Firestore {
    publicPucket: any = null

    constructor(data: IFirestoreAdapters) {
        super(data)
        this.publicPucket = data.publicBucket
    }

    /**
     * 儲存組織Logo
     * @param id 公開的DocId
     * @param logo 
     * @returns 
     */
    async storeLogo(id: string, logo: ILogo) {
        if (logo && typeof logo === 'string') {
            throw "typeof logo === 'string'"
        }
        const { type, buffer } = logo
        await this.publicPucket.deleteFiles({
            prefix: `organization/${id}/logo`,
        })
        const uuid = crypto.randomUUID()
        const blob = this.publicPucket.file(`organization/${id}/logo/${uuid}.${type}`)
        const blobStream = blob.createWriteStream({
            resumable: false,
        })
        const typedResult = Buffer.from(buffer)
        // // Format Image
        // const resizedBufferData = await sharp(typedResult).resize(80, 80).toBuffer();
        // save buffer
        blobStream.end(typedResult)
        const publicUrl = blob.publicUrl()
        return publicUrl
    }

    /**
     * 刪除組織
     * @param uid 使用者uid
     * @param id 文件id
     * @returns 
     */
    async deleteItem(uid: string, id: string) {
        await this.deleteItemById(uid, id)
        await this.publicPucket.deleteFiles({
            prefix: `company/${id}`
        })
        return true
    }

    async getItemById(uid: string, id: string) {
        const organization = this.getItemById()
    }
}