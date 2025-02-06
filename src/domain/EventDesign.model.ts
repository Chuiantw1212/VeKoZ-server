import DataAccess from './DataAccess'
import type { IDataAccessAdapters } from '../entities/dataAccess'
import { ITemplateDesign } from '../entities/eventTemplate'

export default class EventDesignModel extends DataAccess {
    constructor(data: IDataAccessAdapters) {
        super(data)
    }

    /**
     * 建立品項
     * @param uid 
     * @param templateDesign 
     * @returns 
     */
    async createDesign(uid: string, templateDesign: ITemplateDesign) {
        return await this.createUidDoc(uid, templateDesign)
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
        await this.setDocById(id, {
            mutable,
            lastmod,
        }, { merge: true })
        return count
    }

    /**
     * 讀取
     * @param designId 
     */
    async getTemplateDesign(designId: string): Promise<ITemplateDesign> {
        const templateDesign: ITemplateDesign = await this.getDocById(designId) as ITemplateDesign
        return templateDesign
    }

    /**
     * 刪除
     * @param uid 
     * @param id 
     * @returns 
     */
    async deleteTemplateDesign(uid: string, id: string): Promise<number> {
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
}