import FirestoreAdapter from '../adapters/Firestore.adapter'
import type { ICrudOptions, IModelPorts } from '../ports/out.model'
import { ITemplateDesign } from '../entities/eventTemplate'

export default class EventTemplateDesignModel extends FirestoreAdapter {
    constructor(data: IModelPorts) {
        super(data)
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
     * 修改Mutable
     * @param uid 
     * @param id 
     * @param mutable 
     * @returns 
     */
    async patchMutable(uid: string, id: string, mutable: any) {
        const options: ICrudOptions = {
            count: {
                absolute: 1
            },
            merge: true
        }
        const count = await super.setItemsByQuery([['uid', '==', uid], ['id', '==', id]], {
            mutable,
        }, options)
        return count
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
     * @param uid 
     * @param id 
     * @returns 
     */
    async deleteDesignById(uid: string, id: string): Promise<number> {
        const options = {
            count: {
                absolute: 1
            }
        }
        const count = await super.deleteItemById(uid, id,
            options
        )
        return count
    }
}