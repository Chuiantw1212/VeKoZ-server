import Firestore from '../adapters/Firestore.out'
import type { IFirestoreAdapters } from '../entities/firestore'
import { IEventTemplate } from '../entities/eventTemplate'

export default class EventModel extends Firestore {
    constructor(data: IFirestoreAdapters) {
        super(data)
    }

    /**
     * 新增
     * @param uid 
     * @param eventTemplate 
     * @returns 
     */
    async createEvent(uid: string, eventTemplate: IEventTemplate): Promise<IEventTemplate> {
        const newEventDoc: IEventTemplate = await this.createItem(uid, eventTemplate)
        return newEventDoc
    }

    /**
     * 查詢
     * @param eventId 
     * @returns 
     */
    async queryByEventId(eventId: string): Promise<IEventTemplate | 0> {
        const events = await this.getItemsByQuery([['eventId', '==', eventId]]) as IEventTemplate[]
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
    async mergeDesignIds(uid: string, eventId: string, designIds: string[]): Promise<number> {
        const data = {
            designIds,
        }
        const dataAccessOptions = {
            count: {
                min: 0,
            },
            merge: true,
        }
        const count = await super.setItemsByQuery([['uid', '==', uid], ['id', '==', eventId]], data, dataAccessOptions)
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