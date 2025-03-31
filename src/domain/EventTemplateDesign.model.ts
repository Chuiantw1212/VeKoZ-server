import VekozModel from '../adapters/VekozModel.out'
import type { IBlob, IModelPorts, } from '../ports/out.model'
import type { ICrudOptions } from '../ports/out.crud'
import { ITemplateDesign } from '../entities/eventTemplate'

export default class EventTemplateDesignModel extends VekozModel {
    constructor(data: IModelPorts) {
        super(data)
    }

    async devGetAllDesigns(): Promise<ITemplateDesign[]> {
        const designs = await super.getItemsByQuery([])
        return designs
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
    async createTemplateDesign(uid: string, templateDesign: ITemplateDesign) {
        return await super.createItem(uid, templateDesign)
    }

    /**
     * 修改
     * @param uid 
     * @param id 
     * @returns 
     */
    async patchDesignById(uid: string, id: string, data: ITemplateDesign): Promise<number> {
        const options: ICrudOptions = {
            count: {
                absolute: 1
            },
            merge: true
        }
        // 對Blob特殊處理
        if (data.type === 'banner' && typeof data.value !== 'string') {
            const publicUrl = await this.storeBanner(id, data.value)
            data.value = publicUrl
        }
        // 儲存DesignValue
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
        const publicUrl = await super.uploadUniqueImage(`${id}/banner`, banner)
        return publicUrl
    }

    /**
     * 讀取
     * @param designId 
     */
    async getTemplateDesign(designId: string): Promise<ITemplateDesign> {
        const templateDesign: ITemplateDesign = await super.getItemById(designId) as ITemplateDesign
        return templateDesign
    }

    /**
     * 刪除
     * https://cloud.google.com/storage/docs/deleting-objects
     * @param uid 
     * @param id 
     * @returns 
     */
    async deleteDesignById(uid: string, id: string): Promise<number> {
        if (!id) {
            throw `id未提供`
        }
        const options = {
            count: {
                range: [0, 1]
            }
        }
        const count = await super.deleteItemById(uid, id,
            options
        )
        super.deleteBlobFolderById(id)
        return count
    }
}