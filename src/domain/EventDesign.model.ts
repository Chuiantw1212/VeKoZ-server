import FirestoreAdapter from '../adapters/Firestore.adapter'
import type { IModelPorts, IBlob } from '../ports/out.model'
import type { ICrudOptions } from '../ports/out.crud'
import { IPatchTemplateDesignReq, ITemplateDesign } from '../entities/eventTemplate'
import type { Storage } from 'firebase-admin/storage'
export default class EventDesignModel extends FirestoreAdapter {
    private publicBucket: ReturnType<Storage['bucket']> = null as any

    constructor(data: IModelPorts) {
        super(data)
        if (data.publicBucket) {
            this.publicBucket = data.publicBucket
        }
    }

    async setByOrganizationId(uid: string, organizationId: string, data: ITemplateDesign) {
        const options = {
            merge: true,
        }
        return await super.setItemsByQuery([['uid', '==', uid], ['organizationId', '==', organizationId]], data, options)
    }

    /**
     * 建立品項
     * @param uid 
     * @param templateDesign 
     * @returns 
     */
    async createDesign(uid: string, templateDesign: ITemplateDesign) {
        return await super.createItem(uid, templateDesign)
    }

    /**
     * 修改
     * @param uid 
     * @param id 
     * @returns 
     */
    async patchEventDesignById(uid: string, id: string, data: ITemplateDesign) {
        // 對Blob特殊處理
        if (data.type === 'banner' && typeof data.value !== 'string') {
            const publicUrl = await this.storeBanner(id, data.value)
            data.value = publicUrl
        }
        // 儲存資料
        const options: ICrudOptions = {
            merge: true,
            count: {
                absolute: 1
            }
        }
        const count = await super.setItemById(uid, id, data, options)
        return count
    }

    /**
     * 儲存組織Logo
     * @param id 公開的DocId
     * @param logo 
     * @returns 
     */
    private async storeBanner(id: string, banner: IBlob): Promise<string> {
        if (!banner) {
            return ''
        }
        if (banner && typeof banner === 'string') {
            throw "typeof banner === 'string'"
        }
        const { type, buffer } = banner
        try {
            await this.publicBucket.deleteFiles({
                prefix: `eventDesign/${id}`,
            },)
        } catch (error) {
            // 可能會因為沒資料可刪出錯
        }
        const blob = this.publicBucket.file(`eventDesign/${id}/banner.${type}`)
        const blobStream = blob.createWriteStream({
            resumable: false,
        })
        const typedResult = Buffer.from(buffer)
        // save buffer
        blobStream.end(typedResult)
        const publicUrl = blob.publicUrl()
        return publicUrl
    }

    /**
     * 讀取
     * @param designId 
     */
    async getEventDesignById(designId: string): Promise<ITemplateDesign> {
        const templateDesign: ITemplateDesign = await super.getItemById(designId) as ITemplateDesign
        return templateDesign
    }

    /**
     * 刪除
     * @param uid 
     * @param id 
     * @returns 
     */
    async deleteDesignById(uid: string, id: string): Promise<number> {
        try {
            const getFilesResponse = await this.publicBucket.getFiles({
                prefix: `eventDesign/${id}`,
            })
            const files = getFilesResponse[0]
            const promises = files.map(async (file) => {
                return file.delete()
            })
            await Promise.all(promises)
        } catch (error) {
            // 可能會因為沒資料可刪出錯
        }
        const options = {
            count: {
                range: [0, 1]
            }
        }
        const count = await super.deleteItemById(uid, id,
            options
        )
        return count
    }
}