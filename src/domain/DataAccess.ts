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
     * C: 新增document，如果需要確保唯一，call之前先call
     * @param uid user id
     * @param data
     * @param options
     * @returns 
     */
    async createUidDoc(uid: string, data: any, options?: IDataAccessOptions): Promise<DocumentData> {
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
     * R: 依據條件取得唯一資料
     * @param wheres 
     * @param options 
     * @returns 
     */
    async querySingleDoc(wheres: any[][], options: IDataAccessOptions = {}): Promise<DocumentData> {
        Object.assign(options, {
            count: {
                absolute: 1
            }
        })
        const docDatas = await this.queryDocList(wheres, options)
        return docDatas[0]
    }

    /**
     * R: 利用條件查詢資料
     * @param uid 
     * @param options 
     */
    async queryDocList(wheres: any[][], options?: IDataAccessOptions): Promise<DocumentData[]> {
        if (!this.noSQL) {
            throw this.error.noSqlIsNotReady
        }
        // 檢查資料數量
        const query = await this.getQuery(wheres)
        if (options?.count) {
            await this.checkQueryCount(query, options.count)
        }
        // 取得資料
        let docs = (await query.get()).docs
        if (options?.slice) {
            const slice = options.slice
            if (slice instanceof Array) {
                docs = docs.slice(...slice)
            } else {
                docs = docs.slice(slice)
            }
        }
        const docDatas = docs.map(doc => {
            const docData = doc.data()
            delete docData.uid // IMPORTANT
            return docData
        })
        return docDatas
    }

    /**
     * Get all documents in a collection
     * https://firebase.google.com/docs/firestore/query-data/get-data#node.js_6
     * @returns 
     * @deprecated
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

    /**
     * U: 取代現有的Document某個欄位
     * @param uid user id
     * @param data 
     */
    protected async updateDocs(wheres: any[][], data: any, options: IDataAccessOptions = {}): Promise<number> {
        const query: Query = await this.getQuery(wheres)
        const count = await this.checkQueryCount(query, options.count ?? {})
        const lastmod = new Date().toISOString()
        data.lastmod = lastmod
        const docs = (await query.get()).docs
        const promiese = docs.map(doc => {
            return doc.ref.update(data, {
                merge: options?.merge
            })
        })
        await Promise.all(promiese)
        return count
    }

    /**
     * Utility: 取得組合出來的Query，controller不應該知道where語法
     * @param wheres 
     * @returns 
     */
    protected async getQuery(wheres: any[][]): Promise<Query> {
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
     * Utility: 確保Document中的數量有限
     * @param uid user id
     * @returns 
     */
    protected async checkQueryCount(query: Query, options: IDataCountOptions): Promise<number> {
        if (!this.noSQL) {
            throw this.error.noSqlIsNotReady
        }
        const countData = await query.count().get()
        const count: number = countData.data().count
        if (options.max && count >= options.max) {
            const message = `資料數量已達上限: ${count} > ${options.max}`
            console.trace(message)
            throw message
        }
        if (options.min && count <= options.min) {
            const message = `資料數量低於下限: ${count} < ${options.min}`
            console.trace(message)
            throw message
        }
        if (options.absolute && count !== options.absolute) {
            const message = `資料數量數值不合: ${count} !== ${options.absolute}`
            console.trace(message)
            throw message
        }
        if (options.range && !options.range.includes(count)) {
            const message = `資料數量範圍不合: ${count} 不在 ${options.range} 中`
            console.trace(message)
            throw message
        }
        return count
    }

    /**
     * Delete 刪除符合條件的資料
     * @param uid 使用者uid
     * @returns 
     */
    async removeDocs(wheres: any[][], options?: IDataAccessOptions): Promise<number> {
        if (!this.noSQL) {
            throw this.error.noSqlIsNotReady
        }
        const query = await this.getQuery(wheres)
        const count = await this.checkQueryCount(query, options?.count ?? {})
        const docs = (await query.get()).docs
        const promises = docs.map(doc => {
            return doc.ref.delete()
        })
        await Promise.all(promises)
        return count
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

    // ------------------------------------------------------------------------------------------------以下淘汰中

    /**
     * 合併現有的Document
     * @param uid user id
     * @param data 
     * @deprecated
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
     * @deprecated
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
}