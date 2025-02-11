import FirestoreAdapter from '../adapters/Firestore.adapter'
import type { IModelPorts } from '../ports/out.model'
import { IEventTemplate } from '../entities/eventTemplate'

export default class EventTemplateModel extends FirestoreAdapter {
    constructor(data: IModelPorts) {
        super(data)
    }

    /**
     * 新增
     * @param uid 
     * @param eventTemplate 
     * @returns 
     */
    async createTemplate(uid: string, eventTemplate: IEventTemplate): Promise<IEventTemplate> {
        const newTemplateDoc: IEventTemplate = await this.createItem(uid, eventTemplate)
        return newTemplateDoc
    }

    async getTemplateList(uid: string,) {
        const templateList = await super.getItemsByQuery([['uid', '==', uid]])
        return templateList
    }

    /**
     * 讀取
     * @param uid 
     * @returns 
     */
    async readTemplateById(uid: string, id?: string): Promise<IEventTemplate | 0> {
        const wheres = [['uid', '==', uid]]
        if (id) {
            wheres.push(['id', '==', id])
        }
        const eventTemplates = await this.getItemsByQuery(wheres, {
            count: {
                absolute: 1
            }
        })
        return eventTemplates[0]
    }

    /**
     * 修改
     * @param uid 
     * @param eventTemplate 
     * @returns 
     */
    async mergeDesignIds(uid: string, designIds: string[]): Promise<number> {
        const data = {
            designIds,
        }
        const dataAccessOptions = {
            count: {
                absolute: 1 // 如果不是1，就是符合條件統一改寫
            },
            merge: true,
        }
        const count = await super.setItemsByQuery([['uid', '==', uid]], data, dataAccessOptions)
        return count
    }

    /**
     * 刪除
     * @param uid 
     */
    async deleteTemplate(uid: string): Promise<number> {
        const count = await this.deleteItemsByQuery([['uid', '==', uid]], {
            count: {
                absolute: 1
            }
        })
        return count
    }
}