import DataAccess from './DataAccess'
import type { IDataAccessAdapters } from '../entities/dataAccess'
import { IEventTemplate } from '../entities/eventTemplate'

export default class EventModel extends DataAccess {
    constructor(data: IDataAccessAdapters) {
        super(data)
    }

    /**
     * 新增
     * @param uid 
     * @param eventTemplate 
     * @returns 
     */
    async createEvent(uid: string, eventTemplate: IEventTemplate): Promise<IEventTemplate> {
        const newEventDoc: IEventTemplate = await this.createUidDoc(uid, eventTemplate, {
            count: {
                absolute: 0
            }
        })
        return newEventDoc
    }

    /**
     * 查詢
     * @param eventId 
     * @returns 
     */
    async queryByEventId(eventId: string): Promise<IEventTemplate | number> {
        const events = await this.queryDocList([['eventId', '==', eventId]]) as IEventTemplate[]
        if (events) {
            return events[0]
        }
        return 0
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
     * @param eventId 
     * @returns 
     */
    async deleteByEventId(uid: string, eventId: string): Promise<number> {
        const count = await this.removeDocs([['uid', '==', uid], ['eventId', '==', eventId]])
        return count
    }
}