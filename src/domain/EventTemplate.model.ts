import DataAccess from './DataAccess'
import type { IDataAccessAdapters } from '../entities/dataAccess'
import { IEventTemplate } from '../entities/eventTemplate'

export default class EventTemplateModel extends DataAccess {
    constructor(data: IDataAccessAdapters) {
        super(data)
    }

    /**
     * 新增
     * @param uid 
     * @param eventTemplate 
     * @returns 
     */
    async createTemplate(uid: string, eventTemplate: IEventTemplate): Promise<IEventTemplate> {
        const newTemplateDoc: IEventTemplate = await this.createUidDoc(uid, eventTemplate, {
            count: {
                max: 1
            }
        })
        return newTemplateDoc
    }

    /**
     * 讀取
     * @param uid 
     * @returns 
     */
    async readTemplate(uid: string): Promise<IEventTemplate> {
        return await this.querySingleDoc([['uid', '==', uid]], {
            count: {
                range: [0, 1]
            }
        })
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
        const count = await super.updateDocs([['uid', '==', uid]], data, dataAccessOptions)
        return count
    }

    /**
     * 刪除
     * @param uid 
     */
    async deleteTemplate(uid: string): Promise<number> {
        const count = await this.removeDocs([['uid', '==', uid]], {
            count: {
                absolute: 1
            }
        })
        return count
    }
}