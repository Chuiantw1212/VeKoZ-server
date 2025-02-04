import { IDataAccessAdapters } from "../entities/dataAccess"
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
        return await this.createNewDoc(uid, data)
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
     * @returns 
     */
    async createNewDoc(uid: string, data: any, options: any = {}): Promise<any> {
        if (!this.noSQL) {
            throw this.error.noSqlIsNotReady
        }
        // 確保資料新增上限，未來屬於付費功能
        if (options.limit) {
            this.checkUniqueDoc(uid, options.limit)
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
     * 利用user uid取得document
     * @returns 取得資料
     */
    async getUniqueDoc(uid: string): Promise<any> {
        if (!this.noSQL) {
            throw this.error.noSqlIsNotReady
        }
        const targetQuery = this.noSQL.where('uid', '==', uid)
        const countData = await targetQuery.count().get()
        const count: number = countData.data().count
        if (count == 0) {
            // 需要在不知道資料數量時取資料時就不可throw error
            return 0
        }
        const doc = (await targetQuery.get()).docs[0] as any
        const docData = doc.data()
        delete docData.uid // IMPORTANT
        return docData
    }

    /**
     * 合併現有的Document
     * @param uid user id
     * @param data 
     */
    async mergeUniqueDoc(uid: string, data: any): Promise<string> {
        const singleDocSnapshot = await this.checkUniqueDoc(uid, 1)
        const lastmod = new Date().toISOString()
        data.lastmod = lastmod
        singleDocSnapshot.ref.set(data, {
            merge: true
        })
        return lastmod
    }
    /**
     * 取代現有的Document某個欄位
     * @param uid user id
     * @param data 
     */
    async mergeUniqueDocField(uid: string, field: string, data: any): Promise<string> {
        const singleDocSnapshot = await this.checkUniqueDoc(uid, 1)
        const lastmod = new Date().toISOString()
        const docData: any = {
            id: singleDocSnapshot.id,
            uid,
            lastmod,
        }
        docData[field] = data
        singleDocSnapshot.ref.update(docData)
        // delete docData.uid // IMPORTANT
        return lastmod
    }
    /**
     * 確保Document中的數量有限
     * @param uid user id
     * @returns 
     */
    async checkUniqueDoc(uid: string, limit: number = 1): Promise<any> {
        if (!this.noSQL) {
            throw this.error.noSqlIsNotReady
        }
        const targetQuery = this.noSQL.where('uid', '==', uid)
        const countData = await targetQuery.count().get()
        const count: number = countData.data().count
        if (count > limit) {
            const message = `資料數量已達上限:${limit}`
            console.trace(message)
            throw message
        }
        const doc = (await targetQuery.get()).docs[0] as any
        delete doc.uid // IMPORTANT
        return doc
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