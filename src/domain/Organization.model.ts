import FirestoreAdapter from '../adapters/Firestore.adapter'
import type { IModelPorts } from '../ports/out.model'
import { IOrganization } from '../entities/organization';
interface ILogo {
    type: string;
    buffer: Buffer,
}

export default class OrganizationModel extends FirestoreAdapter {
    publicPucket: any = null

    constructor(data: IModelPorts) {
        super(data)
        this.publicPucket = data.publicBucket
    }

    async createOrganization(uid: string, organization: IOrganization) {
        const newOrganization = await super.createItem(uid, organization)
        return newOrganization
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
        await super.deleteItemById(uid, id)
        await this.publicPucket.deleteFiles({
            prefix: `company/${id}`
        })
        return true
    }

    async getOrganizationById(id: string) {
        const organization = await super.getItemById(id)
        return organization
    }

    async mergeOrganizationById(uid: string, id: string, organization: IOrganization): Promise<number> {
        const count = super.setItemsByQuery([['uid', '==', uid], ['id', '==', id]], organization, {
            merge: true,
        })
        return count
    }

    async getOrganizationList() {
        const organizationList = await super.getItemsByQuery([]) as IOrganization[]
        return organizationList
    }
}