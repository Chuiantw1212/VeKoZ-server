import Firestore from '../adapters/Firestore.out'
import type { IFirestoreAdapters } from '../entities/dataAccess'
import type { IEvent } from '../entities/event'

export default class EventSchemaModel extends Firestore {
    constructor(data: IFirestoreAdapters) {
        super(data)
    }

    /**
     * 新增
     * @param uid 
     * @param event 
     * @returns 
     */
    async createRecord(uid: string, event: IEvent): Promise<IEvent> {
        const updatedEvent = await super.createItem(uid, event) as IEvent
        return updatedEvent
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
     * 修改欄位
     * @param uid 
     * @param id 
     * @param data 
     * @returns 
     */
    async patchRecordField(uid: string, id: string, data: IEvent) {
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
     * D
     * @param uid 
     * @param eventId 
     * @returns 
     */
    async dropRecord(uid: string, eventId: string) {
        return await this.deleteItemById(uid, eventId)
    }
}