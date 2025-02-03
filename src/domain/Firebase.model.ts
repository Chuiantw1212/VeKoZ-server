import { CollectionReference, } from 'firebase-admin/firestore'

/**
 * 檔案的Naming要對應firestore的存取方式
 */
export default class FirebaseDataAccess {
    collection: CollectionReference = null as any

    /**
     * Get all documents in a collection
     * https://firebase.google.com/docs/firestore/query-data/get-data#node.js_6
     * @returns 
     */
    async getDocList() {
        const snapshot = await this.collection.get()
        const docDatas = snapshot.docs.map(doc => {
            const docData = doc.data()
            delete docData.uid
            return docData
        });
        return docDatas as any[]
    }

    async queryDocList(uid: string, query: Object,) {
        let targetQuery = this.collection.where('uid', '==', uid)
        const countData = await targetQuery.count().get()
        const count: number = countData.data().count
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
     * 新增document
     * @param uid user id
     * @param data
     * @returns 
     */
    async createNewDoc(uid: string, data: any): Promise<any> {
        const docRef = this.collection.doc()
        const lastmod = new Date().toISOString()
        data.id = docRef.id
        data.lastmod = lastmod
        await this.collection.doc(data.id).set({
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
        const targetQuery = this.collection.where('uid', '==', uid)
        const countData = await targetQuery.count().get()
        const count: number = countData.data().count
        if (count == 0) {
            throw 'uid不存在'
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
        const singleDocSnapshot = await this.checkUniqueDoc(uid)
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
    async mergeUniqueDocField(uid: string, field: string, data: any): Promise<any> {
        const singleDocSnapshot = await this.checkUniqueDoc(uid)
        const docData: any = {
            id: singleDocSnapshot.id,
            uid,
        }
        docData[field] = data
        singleDocSnapshot.ref.update(docData)
        delete docData.uid // IMPORTANT
        return docData
    }
    /**
     * 確保Document uid是唯一的
     * @param uid user id
     * @returns 
     */
    async checkUniqueDoc(uid: string): Promise<any> {
        const targetQuery = this.collection.where('uid', '==', uid)
        const countData = await targetQuery.count().get()
        const count: number = countData.data().count
        if (count == 0) {
            throw 'uid不存在'
        }
        if (count > 1) {
            throw '現有資料重複uid'
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
        const targetQuery = this.collection.where('uid', '==', uid)
        const countData = await targetQuery.count().get()
        const count: number = countData.data().count
        if (count == 0) {
            throw 'uid不存在'
        }
        if (count > 1) {
            throw '現有資料重複uid'
        }
        (await targetQuery.get()).forEach(doc => {
            this.collection.doc(doc.id).delete()
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
        const targetQuery = this.collection.where('uid', '==', uid)
        const countData = await targetQuery.count().get()
        const count: number = countData.data().count
        if (count == 0) {
            throw 'uid不存在'
        }
        const targetDoc = (await targetQuery.get()).docs.find(async doc => {
            return doc.id === id
        })
        if (targetDoc) {
            await this.collection.doc(targetDoc.id).delete()
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
        const targetQuery = this.collection.where('uid', '==', uid)
        const countData = await targetQuery.count().get()
        const count: number = countData.data().count
        if (count == 0) {
            throw 'uid不存在'
        }
        const targetDoc = (await targetQuery.get()).docs.find(async doc => {
            return doc.id === id
        })
        console.log({
            data
        })
        if (targetDoc) {
            await this.collection.doc(targetDoc.id).update(data, { merge: true })
        }
        return 1
    }
}