import DataAccess from './DataAccess'
import type { IDataAccessAdapters } from '../entities/dataAccess'

export default class EventTemplateDesignModel extends DataAccess {
    constructor(data: IDataAccessAdapters) {
        super(data)
    }
    async patchMutable(uid: string, id: string, mutable: any) {
        if (!this.noSQL) {
            throw this.error.noSqlIsNotReady
        }
        const query = await this.noSQL.where('id', '==', id).where('uid', '==', uid)
        const count = (await query.count().get()).data().count
        if (count !== 1) {
            throw '資料超出限制'
        }
        const doc = (await query.get()).docs[0]
        const lastmod = new Date().toISOString()
        this.noSQL.doc(doc.id).set({
            mutable,
            lastmod,
        }, { merge: true })
        return lastmod
    }
}