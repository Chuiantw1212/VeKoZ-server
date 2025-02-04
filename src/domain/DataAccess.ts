import { isArray } from "util"
import { IDataAccessAdapters, IDataAccessOptions, IDataCount, IDataCountOptions, IQuery } from "../entities/dataAccess"
import { CollectionReference, DocumentData, FieldValue, Query } from "firebase-admin/firestore"

/**
 * 檔案的Naming要對應firestore的存取方式
 */
export default class DataAccess {
    protected noSQL: IDataAccessAdapters['noSQL'] = null as any
    protected SQL: IDataAccessAdapters['SQL'] = null as any
    protected error = {
        'noSqlIsNotReady': 'NoSQL instance is not ready.',
        'sqlIsNotReady': 'SQL instance is not ready.',
        'docNoFound': 'Data not found by given condition',
    }

    constructor(data: IDataAccessAdapters) {
        const { noSQL, SQL } = data
        if (noSQL) {
            this.noSQL = noSQL
        }
        if (SQL) {
            this.SQL = SQL
        }
    }

    /**
     * 模仿SQL插入語法，未來銜接Cloud SQL使用
     * @param uid 使用者uid
     * @param data 任何資料
     * @returns 
     */
    async insertRecord(uid: string, data: any): Promise<any> {
        return await this.createUidDoc(uid, data)
    }

    // async selectRecord(query: Object,) {
    //     return await this.getDocList(query)
    // }

    /**
     * Get all documents in a collection
     * https://firebase.google.com/docs/firestore/query-data/get-data#node.js_6
     * @returns 
     */
    async getDocList() {
        if (!this.noSQL) {
            throw this.error.noSqlIsNotReady
        }
        const snapshot = await this.noSQL.get()
        const docDatas = snapshot.docs.map(doc => {
            const docData = doc.data()
            delete docData.uid
            return docData
        });
        return docDatas as any[]
    }

    async queryDocList(uid: string, query: Object,) {
        if (!this.noSQL) {
            return
        }
        let targetQuery = this.noSQL.where('uid', '==', uid)
        const countData = await targetQuery.count().get()
        const count: number = countData.data().count || 0
        if (count == 0) {
            throw 'uid不存在'
        }
        for (let condition in query) {
            const value = (query as any)[condition]
            targetQuery = targetQuery.where(condition, '==', value)
        }
        const docDatas: any[] = (await targetQuery.get()).docs.map(doc => {
            const docData = doc.data()
            delete docData.uid
            return docData
        })
        return docDatas
    }

    /**
     * 新增document，如果需要確保唯一，call之前先call
     * @param uid user id
     * @param data
     * @param options
     * @returns 
     */
    async createUidDoc(uid: string, data: any, options?: IDataAccessOptions): Promise<any> {
        if (!this.noSQL) {
            throw this.error.noSqlIsNotReady
        }
        const query = await this.getQuery([['uid', '==', uid]])
        if (options?.count) {
            await this.checkQueryCount(query, options.count)
        }
        const docRef = this.noSQL.doc()
        const lastmod = new Date().toISOString()
        data.id = docRef.id
        data.lastmod = lastmod
        await this.noSQL.doc(data.id).set({
            ...data,
            uid // IMPORTANT 否則新資料會是null
        })
        return data
    }

    /**
     * 利用user uid取得多個docuemnt
     * @returns 取得資料
     */
    async queryUidDocList(uid: string, options?: IDataAccessOptions): Promise<DocumentData[]> {
        if (!this.noSQL) {
            throw this.error.noSqlIsNotReady
        }
        const query = await this.getQuery([['uid', '==', uid]])
        if (options?.count) {
            await this.checkQueryCount(query, options.count)
        }

        let docs = (await query.get()).docs
        if (options?.slice) {
            const slice = options.slice
            if (slice instanceof Array) {
                docs = docs.slice(...slice)
            } else {
                docs = docs.slice(slice)
            }
        }
        const docsData = docs.map(doc => {
            const docData = doc.data()
            delete docData.uid // IMPORTANT
            return docData
        })
        return docsData
    }

    /**
     * 取得唯一的uid document
     * @param uid 
     * @param options 
     * @returns 
     */
    async getSingleUidDoc(uid: string, options?: IDataAccessOptions): Promise<DocumentData> {
        const docsData = await this.queryUidDocList(uid, options)
        return docsData[0]
    }

    /**
     * 合併現有的Document
     * @param uid user id
     * @param data 
     */
    async mergeUniqueDoc(uid: string, data: any): Promise<string> {
        // const singleDocSnapshot = await this.checkQueryCount(uid, 1)
        // const lastmod = new Date().toISOString()
        // data.lastmod = lastmod
        // singleDocSnapshot.ref.set(data, {
        //     merge: true
        // })
        // return lastmod
        return ''
    }
    /**
     * 取代現有的Document某個欄位
     * @param uid user id
     * @param data 
     */
    async mergeUniqueDocField(uid: string, field: string, data: any): Promise<string> {
        // const singleDocSnapshot = await this.checkQueryCount(uid, 1)
        // const lastmod = new Date().toISOString()
        // const docData: any = {
        //     id: singleDocSnapshot.id,
        //     uid,
        //     lastmod,
        // }
        // docData[field] = data
        // singleDocSnapshot.ref.update(docData)
        // // delete docData.uid // IMPORTANT
        // return lastmod
    }

    /**
     * 移除某個欄位
     * @param uid 
     * @param field 
     */
    async deleteUniqueField(uid: string, field: string) {
        // const singleDocSnapshot = await this.checkQueryCount(uid, 1)
        const removeObjec: { [key: string]: any } = {}
        removeObjec[field] = FieldValue.delete()
        // await singleDocSnapshot.update(removeObjec);
    }

    async getQuery(wheres: any[][]): Promise<Query> {
        if (!this.noSQL) {
            throw this.error.noSqlIsNotReady
        }
        let query: CollectionReference | Query = this.noSQL
        wheres.forEach((where: any[]) => {
            const field = where[0]
            const operator = where[1]
            const value = where[2]
            query = query.where(field, operator, value)
        })
        return query
    }

    /**
     * 確保Document中的數量有限
     * @param uid user id
     * @returns 
     */
    async checkQueryCount(query: Query, options: IDataCountOptions): Promise<number> {
        if (!this.noSQL) {
            throw this.error.noSqlIsNotReady
        }
        const countData = await query.count().get()
        const count: number = countData.data().count
        if (options.max && count > options.max) {
            const message = `資料數量已達上限:${options.max}`
            console.trace(message)
            throw message
        }
        if (options.min && count < options.min) {
            const message = `資料數量低於下限:${options.min}`
            console.trace(message)
            throw message
        }
        if (options.absolute && count !== options.absolute) {
            const message = `資料數量不為:${options.absolute}`
            console.trace(message)
            throw message
        }
        return count
    }

    /**
     * 刪除唯一的文件
     * @param uid 使用者uid
     * @returns 
     */
    async removeUniqueDoc(uid: string): Promise<number> {
        if (!this.noSQL) {
            throw this.error.noSqlIsNotReady
        }
        const targetQuery = this.noSQL.where('uid', '==', uid)
        const countData = await targetQuery.count().get()
        const count: number = countData.data().count
        if (count == 0) {
            throw 'uid不存在'
        }
        if (count > 1) {
            throw '現有資料重複uid'
        }
        (await targetQuery.get()).docs.forEach(doc => {
            if (this.noSQL) {
                this.noSQL.doc(doc.id).delete()
            }
        })
        return 1
    }

    /**
     * 刪除其中一個由使用者建立的文件
     * @param uid 使用者uid
     * @param id 文件id
     * @returns 
     */
    async deleteByDocId(uid: string, id: string): Promise<number> {
        if (!this.noSQL) {
            throw this.error.noSqlIsNotReady
        }
        const targetQuery = this.noSQL.where('uid', '==', uid)
        const countData = await targetQuery.count().get()
        const count: number = countData.data().count
        if (count == 0) {
            throw 'uid不存在'
        }
        const targetDoc = (await targetQuery.get()).docs.find(async doc => {
            return doc.id === id
        })
        if (targetDoc) {
            await this.noSQL.doc(targetDoc.id).delete()
            return 1
        } else {
            return 0
        }
    }

    /**
     * 更新其中一個由使用者建立的文件
     * @param uid 使用者uid
     * @param id 文件id
     * @returns 
     */
    async mergeByDocId(uid: string, id: string, data: any): Promise<number> {
        if (!this.noSQL) {
            throw this.error.noSqlIsNotReady
        }
        const targetQuery = this.noSQL.where('uid', '==', uid)
        const countData = await targetQuery.count().get()
        const count: number = countData.data().count
        if (count == 0) {
            throw 'uid不存在'
        }
        const targetDoc = (await targetQuery.get()).docs.find(async doc => {
            return doc.id === id
        })
        if (targetDoc) {
            await this.noSQL.doc(targetDoc.id).update(data, { merge: true })
        }
        return 1
    }

    /**
     * 取得文檔
     * @param id 文件DocId
     * @returns 
     */
    async getByDocId(id: string) {
        if (!this.noSQL) {
            throw this.error.noSqlIsNotReady
        }
        const docData = (await this.noSQL.doc(id).get()).data()
        return docData
    }
}