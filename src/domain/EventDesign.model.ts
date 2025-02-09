import Firestore from '../adapters/Firestore.out'
import type { ICrudOptions, IFirestoreAdapters } from '../entities/dataAccess'
import { ITemplateDesign } from '../entities/eventTemplate'

export default class EventDesignModel extends Firestore {
    constructor(data: IFirestoreAdapters) {
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
        const count = await super.setItemsByQuery([['uid', '==', uid], ['id', '==', id]], {
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
                absolute: 1
            }
        }
        const count = await super.deleteItemsByQuery(
            [['uid', '==', uid], ['id', '==', id]],
            options
        )
        return count
    }

    /**
     * 刪除
     * @param uid 
     * @param id 
     * @returns 
     */
    async deleteDesignByEventId(uid: string, eventId: string): Promise<number> {
        const options = {
            count: {
                absolute: 1
            }
        }
        const count = await super.deleteItemsByQuery(
            [['uid', '==', uid], ['eventId', '==', eventId]],
            options
        )
        return count
    }
}