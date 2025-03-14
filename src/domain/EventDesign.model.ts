import VekozModel from '../adapters/VekozModel.out'
import type { IModelPorts, IBlob } from '../ports/out.model'
import type { ICrudOptions } from '../ports/out.crud'
import { ITemplateDesign } from '../entities/eventTemplate'
import { Timestamp } from 'firebase-admin/firestore'
export default class EventDesignModel extends VekozModel {
    constructor(data: IModelPorts) {
        super(data)
    }

    async setByOrganizationId(uid: string, organizer: string, data: ITemplateDesign) {
        const options = {
            merge: true,
        }
        return await super.setItemsByQuery([['uid', '==', uid], ['organizer', '==', organizer]], data, options)
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
        if (data.startDate) {
            const formatStart = super.formatDate(data.startDate)
            if (formatStart instanceof Date) {
                data.startDate = formatStart
            }
        }
        if (data.endDate) {
            const formatStart = super.formatDate(data.endDate)
            if (formatStart instanceof Date) {
                data.endDate = formatStart
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
        await super.deleteBlobFolderById(id)
        const publicUrl = await super.uploadUniqueImage(`${id}/banner`, banner)
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
        const options = {
            count: {
                range: [0, 1]
            }
        }
        const count = await super.deleteItemById(uid, id,
            options
        )
        await super.deleteBlobFolderById(id)
        return count
    }
}