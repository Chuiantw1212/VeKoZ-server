import type { IOptionsItem, } from '../entities/select'
import { Query, QuerySnapshot, DocumentReference, DocumentData, } from 'firebase-admin/firestore'
import type { IDataAccessAdapters } from '../entities/dataAccess'
import DataAccess from './DataAccess'

export default class SelectModel extends DataAccess {
    constructor(data: IDataAccessAdapters) {
        super(data)
    }
    async getOptionsByKey(key: string,): Promise<IOptionsItem[]> {
        try {
            if (!this.noSQL) {
                throw this.error.noSqlIsNotReady
            }
            const keyQuery: Query = this.noSQL.where('key', '==', key).limit(1)
            const snapshot: QuerySnapshot = await keyQuery.get()
            if (snapshot.docs.length) {
                const options: IOptionsItem[] = snapshot.docs[0].data().options
                return options
            } else {
                return []
            }
        } catch (error: any) {
            console.trace(error)
            throw error.message || error
        }
    }
    async replaceByKey(key: string, options: IOptionsItem[] = []) {
        if (!this.noSQL) {
            throw this.error.noSqlIsNotReady
        }
        const keyQuery: Query = this.noSQL.where('key', '==', key)
        const countData: DocumentData = await keyQuery.count().get()
        const count: number = countData.data().count
        switch (count) {
            case 0: {
                this.noSQL.add({
                    key,
                    options
                })
                break;
            }
            case 1: {
                const snapshot: QuerySnapshot = await keyQuery.get()
                snapshot.forEach(data => {
                    const dataReference: DocumentReference = data.ref
                    dataReference.set({
                        options,
                    }, { merge: true });
                })
                break;
            }
            default: {
                throw '資料有誤'
            }
        }
    }
}