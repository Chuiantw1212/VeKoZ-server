import Firestore from '../adapters/Firestore.out'
import type { IFirestoreAdapters } from '../entities/firestore'
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
        return await this.createItem(uid, templateDesign)
    }

    /**
     * 修改Mutable
     * @param uid 
     * @param id 
     * @param mutable 
     * @returns 
     */
    async patchMutable(uid: string, id: string, mutable: any) {
        const query = await this.getQuery([['uid', '==', uid], ['id', '==', id]],)
        const count = await this.checkQueryCount(query, {
            absolute: 1
        })
        const lastmod = new Date().toISOString()
        await this.setItemById(id, {
            mutable,
            lastmod,
        }, { merge: true })
        return count
    }

    /**
     * 讀取
     * @param designId 
     */
    async getEventDesign(designId: string): Promise<ITemplateDesign> {
        const templateDesign: ITemplateDesign = await this.getItemById(designId) as ITemplateDesign
        return templateDesign
    }

    // /**
    //  * 
    //  */
    // async getDate(designId: string): Promise<ITemplateDesign> {
    //     // const date = await this.getDocField(designId, 'startDate')
    // }

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
        const count = await this.removeDocs(
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
        const count = await this.removeDocs(
            [['uid', '==', uid], ['eventId', '==', eventId]],
            options
        )
        return count
    }
}