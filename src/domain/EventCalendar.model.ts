import FirestoreAdapter from '../adapters/Firestore.adapter'
import type { IFirestoreAdapters } from '../entities/dataAccess'
import { IEventTemplate } from '../entities/eventTemplate'

export default class EventCalendarModel extends FirestoreAdapter{
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
        const newEventDoc: IEventTemplate = await super.createItem(uid, eventTemplate)
        return newEventDoc
    }
}