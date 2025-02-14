import FirestoreAdapter from '../adapters/Firestore.adapter'
import type { IModelPorts } from '../ports/out.model'
import type { IEvent } from '../entities/event'

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
        if (event.startDate) {
            event.startDate = super.formatTimestamp(event.startDate)
        }
        if (event.endDate) {
            event.endDate = super.formatTimestamp(event.endDate)
        }
        const newEventDoc: IEvent = await super.createItem(uid, event)
        return newEventDoc
    }

    /**
     * R
     * @param condition 
     * @returns 
     */
    async getAvailableEventList(condition: IEvent): Promise<IEvent[]> {
        const docDatas = await super.getItemsByQuery([['startDate', '>=', new Date(condition.startDate)]])
        docDatas.forEach(docData => {
            if (docData.startDate) {
                docData.startDate = super.formatDate(docData.startDate)
            }
            if (docData.endDate) {
                docData.endDate = super.formatDate(docData.endDate)
            }
        })
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
            const event = events[0]
            if (event.startDate) {
                event.startDate = super.formatDate(event.startDate)
            }
            if (event.endDate) {
                event.endDate = super.formatDate(event.endDate)
            }
            return event
        }
        return 0
    }

    /**
     * 修改
     * @param uid 
     * @param id 
     * @param data 
     * @returns 
     */
    async mergeEventById(uid: string, id: string, event: IEvent): Promise<number> {
        if (event.startDate) {
            event.startDate = super.formatTimestamp(event.startDate)
        }
        if (event.endDate) {
            event.endDate = super.formatTimestamp(event.endDate)
        }
        const dataAccessOptions = {
            count: {
                absolute: 1
            },
            merge: true,
        }
        const count = await super.setItemsByQuery([['uid', '==', uid], ['id', '==', id]], event, dataAccessOptions)
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