import FirestoreAdapter from '../adapters/Firestore.adapter'
import type { IModelPorts } from '../ports/out.model'
import type { ICrudOptions } from '../ports/out.crud'
import { ITemplateDesign } from '../entities/eventTemplate'

export default class EventDesignModel extends FirestoreAdapter {
    constructor(data: IModelPorts) {
        super(data)
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
     * 修改Mutable
     * @param uid 
     * @param id 
     * @param mutable 
     * @returns 
     */
    async patchMutable(uid: string, id: string, mutable: any) {
        const options: ICrudOptions = {
            merge: true,
            count: {
                absolute: 1
            }
        }
        const count = await super.setItemById(uid, id, {
            mutable,
        }, options)
        return count
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
        return count
    }
}