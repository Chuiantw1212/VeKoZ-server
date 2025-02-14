import FirestoreAdapter from '../adapters/Firestore.adapter'
import type { IModelPorts } from '../ports/out.model'
import type { IEvent } from '../entities/event'
import { IEventTemplate } from '../entities/eventTemplate'

export default class EventModel extends FirestoreAdapter {
    constructor(data: IModelPorts) {
        super(data)
    }

    /**
     * 新增
     * @param uid 
     * @param event 
     * @returns 
     */
    async createEvent(uid: string, event: IEvent): Promise<IEvent> {
        const newEventDoc: IEvent = await super.createItem(uid, event)
        return newEventDoc
    }

    /**
     * R
     * @param condition 
     * @returns 
     */
    async getAvailableEventList(condition: IEvent): Promise<IEvent[]> {
        const docDatas = await super.getItemsByQuery([['startDate', '>=', condition.startDate]])
        return docDatas as IEvent[]
    }

    /**
     * 查詢
     * @param id 
     * @returns 
     */
    async getEventById(id: string): Promise<IEvent | 0> {
        const events = await super.getItemsByQuery([['id', '==', id]]) as IEvent[]
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
    async mergeDesignIds(uid: string, id: string, designIds: string[]): Promise<number> {
        const data = {
            designIds,
        }
        const dataAccessOptions = {
            count: {
                min: 0,
            },
            merge: true,
        }
        const count = await super.setItemsByQuery([['uid', '==', uid], ['id', '==', id]], data, dataAccessOptions)
        return count
    }

    /**
     * 修改
     * @param uid 
     * @param eventTemplate 
     * @returns 
     */
    async mergeEventById(uid: string, id: string, data: any): Promise<number> {
        const dataAccessOptions = {
            count: {
                absolute: 1
            },
            merge: true,
        }
        const count = await super.setItemsByQuery([['uid', '==', uid], ['id', '==', id]], data, dataAccessOptions)
        return count
    }

    /**
     * 刪除
     * @param uid 
     * @param id 
     * @returns 
     */
    async deleteByEventId(uid: string, id: string): Promise<number> {
        const count = await super.deleteItemById(uid, id)
        return count
    }
}