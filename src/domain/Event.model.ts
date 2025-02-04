import DataAccess from './DataAccess'
import type { IDataAccessAdapters } from '../entities/dataAccess'
import { IEventTemplate } from '../entities/eventTemplate'

export default class EventModel extends DataAccess {
    constructor(data: IDataAccessAdapters) {
        super(data)
    }
    async queryByEventId(eventId: string): Promise<IEventTemplate> {
        if (!this.noSQL) {
            throw this.error.noSqlIsNotReady
        }
        const targetQuery = this.noSQL.where('eventId', '==', eventId)
        const countData = await targetQuery.count().get()
        const count: number = countData.data().count || 0
        if (!count) {
            throw this.error.docNoFound
        }
        const docData = (await targetQuery.get()).docs[0].data()
        return docData
    }

    async deleteByEventId(uid: string, eventId: string): Promise<number> {
        if (!this.noSQL) {
            throw this.error.noSqlIsNotReady
        }
        const targetQuery = this.noSQL.where('uid', '==', uid).where('eventId', '==', eventId)
        const countData = await targetQuery.count().get()
        const count: number = countData.data().count || 0
        const deletePromises = (await targetQuery.get()).docs.map(doc => {
            return this.noSQL?.doc(doc.id).delete()
        })
        await Promise.all(deletePromises)
        return count
    }
}