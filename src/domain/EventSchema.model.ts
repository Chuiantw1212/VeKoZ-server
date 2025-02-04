import DataAccess from './DataAccess'
import type { IDataAccessAdapters } from '../entities/dataAccess'
import type { IEvent } from '../entities/event'

export default class EventSchemaModel extends DataAccess {
    constructor(data: IDataAccessAdapters) {
        super(data)
    }
    async selectRecords(query: IEvent) {
        if (!this.noSQL) {
            throw this.error.noSqlIsNotReady
        }
        if (!query.startDate) {
            throw 'startDate未提供'
        }
        let targetQuery = this.noSQL.where('startDate', '>=', query.startDate)
        if (query.endDate) {
            targetQuery = targetQuery.where('endDate', '<=', query.startDate)
        }
        const docDatas: any[] = (await targetQuery.get()).docs.map(doc => {
            const docData = doc.data()
            delete docData.uid
            return docData
        })
        return docDatas
    }

    async dropRecord(uid: string, eventId: string) {
        return await this.deleteByDocId(uid, eventId)
    }
}