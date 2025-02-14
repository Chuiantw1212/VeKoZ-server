import FirestoreAdapter from '../adapters/Firestore.adapter'
import type { IModelPorts } from '../ports/out.model'
import type { ICrudOptions } from '../ports/out.crud'
import { ITemplateDesign, IPatchTemplateDesignReq } from '../entities/eventTemplate'

export default class EventTemplateDesignModel extends FirestoreAdapter {
    private publicBucket: any = null

    constructor(data: IModelPorts) {
        super(data)
        this.publicBucket = data.publicBucket
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
    async patchDesignById(uid: string, id: string, data: IPatchTemplateDesignReq) {
        const options: ICrudOptions = {
            count: {
                absolute: 1
            },
            merge: true
        }
        if (data.type === 'banner') {
            // this.publicBucket.
            return 0
        } else {
            const count = await super.setItemById(uid, id, {
                data,
            }, options)
            return count
        }
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