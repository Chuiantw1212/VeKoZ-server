import DataAccess from './DataAccess'
import type { IDataAccessAdapters } from '../entities/dataAccess'
import type { IEvent } from '../entities/event'

export default class EventSchemaModel extends DataAccess {
    constructor(data: IDataAccessAdapters) {
        super(data)
    }

    /**
     * 新增
     * @param uid 
     * @param event 
     * @returns 
     */
    async createRecord(uid: string, event: IEvent): Promise<IEvent> {
        const updatedEvent = await this.createUidDoc(uid, event) as IEvent
        return updatedEvent
    }

    /**
     * R
     * @param condition 
     * @returns 
     */
    async selectRecords(condition: IEvent): Promise<IEvent[]> {
        const docDatas = await this.queryDocList([['startDate', '>=', condition.startDate], ['endDate', '<=', condition.startDate]])
        return docDatas as IEvent[]
    }

    /**
     * D
     * @param uid 
     * @param eventId 
     * @returns 
     */
    async dropRecord(uid: string, eventId: string) {
        return await this.deleteByDocId(uid, eventId)
    }
}