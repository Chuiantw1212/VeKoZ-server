import DataAccess from './DataAccess'
import type { IDataAccessAdapters } from '../entities/dataAccess'
import { IEventTemplate } from '../entities/eventTemplate'

export default class EventTemplateModel extends DataAccess {
    constructor(data: IDataAccessAdapters) {
        super(data)
    }
    async updateDesignIds(uid: string, designIds: string[]): Promise<number> {
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
    async createTemplate(uid: string, eventTemplate: IEventTemplate): Promise<IEventTemplate> {
        const newTemplateDoc: IEventTemplate = await this.createUidDoc(uid, eventTemplate, {
            count: {
                max: 1
            }
        })
        return newTemplateDoc
    }
}