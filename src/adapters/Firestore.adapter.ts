import { IModelPorts, } from "../ports/out.model"
import type { ICrudOptions, IDataCountOptions } from "../ports/out.crud"
import { CollectionReference, DocumentData, DocumentSnapshot, Query, SetOptions } from "firebase-admin/firestore"
import VenoniaCRUD from "../ports/out.crud"
/**
 * 檔案的Naming要對應firestore的存取方式
 */
export default class FirestoreAdapter extends VenoniaCRUD {
    protected collection: IModelPorts['collection'] = null as any
    protected error = {
        'collectionIsNotReady': 'Collection is not ready.',
        'docNoFound': 'Data not found by given condition',
    }

    constructor(data: IModelPorts) {
        super()
        const { collection, } = data
        if (collection) {
            this.collection = collection
        }
    }


    /**
     * C: 新增document，如果需要確保唯一，call之前先call
     * @param uid user id
     * @param data
     * @param options
     * @returns 
     */
    protected async createItem(uid: string, data: any, options?: ICrudOptions): Promise<DocumentData> {
        if (!this.collection) {
            throw this.error.collectionIsNotReady
        }
        const query = await this.getQuery([['uid', '==', uid]])
        if (options?.count) {
            await this.checkQueryCount(query, options.count)
        }
        const docRef = this.collection.doc()
        const lastmod = new Date().toISOString()
        if (!data.id) {
            data.id = docRef.id
        }
        data.lastmod = lastmod
        await this.collection.doc(data.id).set({
            ...data,
            uid // IMPORTANT 否則新資料會是null
        })
        return data
    }

    /**
     * R: 利用document id取得唯一資料
     * @param id 
     * @returns 
     */
    protected async getItemById(id: string): Promise<DocumentData | number> {
        if (!this.collection) {
            throw this.error.collectionIsNotReady
        }
        const documentSnapshot: DocumentSnapshot = await this.collection.doc(id).get()
        const docData = documentSnapshot.data()
        if (docData) {
            delete docData.uid
            return docData
        }
        return 0
    }

    /**
     * R: 利用條件查詢資料
     * @param uid 
     * @param options 
     */
    protected async getItemsByQuery(wheres: any[][], options?: ICrudOptions): Promise<DocumentData[]> {
        if (!this.collection) {
            throw this.error.collectionIsNotReady
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
     * R: 讀取全部的資料
     * https://firebase.google.com/docs/firestore/query-data/get-data#node.js_6
     * @returns 
     * @deprecated
     */
    protected async getDocList() {
        if (!this.collection) {
            throw this.error.collectionIsNotReady
        }
        const snapshot = await this.collection.get()
        const docDatas = snapshot.docs.map((doc: DocumentData) => {
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
    protected async setItemsByQuery(wheres: any[][], data: any, options: ICrudOptions = {}): Promise<number> {
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
     * Delete 刪除符合條件的資料
     * @param uid 使用者uid
     * @returns 
     */
    protected async deleteItemsByQuery(wheres: any[][], options?: ICrudOptions): Promise<number> {
        if (!this.collection) {
            throw this.error.collectionIsNotReady
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
     * 刪除其中一個由使用者建立的文件
     * @param uid 使用者uid
     * @param id 文件id
     * @returns 
     */
    protected async deleteItemById(uid: string, id: string, options?: ICrudOptions): Promise<number> {
        if (!this.collection) {
            throw this.error.collectionIsNotReady
        }
        const targetQuery = this.collection.where('uid', '==', uid)
        const countData = await targetQuery.count().get()
        const count: number = countData.data().count
        if (count == 0) {
            throw 'uid不存在'
        }
        const targetDoc = (await targetQuery.get()).docs.find(async (doc: DocumentData) => {
            return doc.id === id
        })
        if (targetDoc) {
            console.log(targetDoc.id)
            // await this.collection.doc(targetDoc.id).delete()
            return 1
        } else {
            return 0
        }
    }

    /**
     * Utility: 取得組合出來的Query，controller不應該知道where語法
     * @param wheres 
     * @returns 
     */
    protected async getQuery(wheres: any[][]): Promise<Query> {
        if (!this.collection) {
            throw this.error.collectionIsNotReady
        }
        let query: CollectionReference | Query = this.collection
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
    protected async checkQueryCount(query: Query, options: IDataCountOptions = {}): Promise<number> {
        if (!this.collection) {
            throw this.error.collectionIsNotReady
        }
        const countData = await query.count().get()
        const count: number = countData.data().count
        if (options.max && count >= options.max) {
            const message = `資料數量已達上限: ${count} > ${options.max}`
            throw message
        }
        if (options.min && count <= options.min) {
            const message = `資料數量低於下限: ${count} < ${options.min}`
            throw message
        }
        if (options.absolute && count !== options.absolute) {
            const message = `資料數量數值不合: ${count} !== ${options.absolute}`
            throw message
        }
        if (options.range && !options.range.includes(count)) {
            const message = `資料數量範圍不合: ${count} 不在 ${options.range} 中`
            throw message
        }
        return count
    }

    /**
     * 模仿SQL插入語法，未來銜接Cloud SQL使用
     * @param uid 使用者uid
     * @param data 任何資料
     * @returns 
     */
    protected async insertRecord(uid: string, data: any): Promise<any> {
        return await this.createItem(uid, data)
    }

    // ------------------------------------------------------------------------------------------------以下淘汰中

    /**
     * 合併現有的Document
     * @param uid user id
     * @param data 
     * @deprecated
     */
    protected async mergeUniqueDoc(uid: string, data: any): Promise<string> {
        // const singleDocSnapshot = await this.checkQueryCount(uid, 1)
        // const lastmod = new Date().toISOString()
        // data.lastmod = lastmod
        // singleDocSnapshot.ref.set(data, {
        //     merge: true
        // })
        // return lastmod
        return ''
    }
}