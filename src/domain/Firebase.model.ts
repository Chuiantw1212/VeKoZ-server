import { Query, QuerySnapshot, CollectionReference, DocumentReference, DocumentData, Firestore } from 'firebase-admin/firestore'

/**
 * 檔案的Naming要對應firestore的存取方式
 */
export default class FirestoreDataAccess {
    collection: CollectionReference = null as any

    /**
     * Get all documents in a collection
     * https://firebase.google.com/docs/firestore/query-data/get-data#node.js_6
     * @returns 
     */
    async getList() {
        const snapshot = await this.collection.get()
        const docDatas = snapshot.docs.map(doc => {
            const docData = doc.data()
            delete docData.uid
            return docData
        });
        return docDatas as any[]
    }

    /**
     * 新增document
     * @param uid user id
     * @param data
     * @returns 
     */
    createNewDoc(uid: string, data: any) {
        const docRef = this.collection.doc()
        data.id = docRef.id
        this.collection.doc(data.id).set({
            ...data,
            uid // IMPORTANT 否則新資料會是null
        })
        return data
    }

    /**
     * 利用user uid取得document
     */
    async getUniqueDoc(uid: string) {
        const targetQuery = this.collection.where('uid', '==', uid)
        const countData = await targetQuery.count().get()
        const count: number = countData.data().count
        if (count == 0) {
            return {}
        }
        const doc = (await targetQuery.get()).docs[0] as any
        const docData = doc.data()
        delete docData.uid
        return docData
    }

    /**
     * 合併現有的Document
     * @param uid user id
     * @param data 
     */
    async mergeUniqueDoc(uid: string, data: any) {
        const singleDocSnapshot = await this.checkUniqueDoc(uid)
        singleDocSnapshot.ref.set(data, {
            merge: true
        })
        return data
    }
    /**
     * 取代現有的Document某個欄位
     * @param uid user id
     * @param data 
     */
    async mergeUniqueDocField(uid: string, field: string, data: any) {
        const singleDocSnapshot = await this.checkUniqueDoc(uid)
        const user: { id: string, uid: string, [key: string]: any } = {
            id: singleDocSnapshot.id,
            uid,
        }
        user[field] = data
        singleDocSnapshot.ref.update(user)
    }
    /**
     * 確保Document uid是唯一的
     * @param uid user id
     * @returns 
     */
    async checkUniqueDoc(uid: string) {
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
        delete doc.uid
        return doc
    }

    async removeUniqueDoc(uid: string) {
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
        return count
    }

    /**
     * 
     * @param uid 使用者uid
     * @param id 文件id
     * @returns 
     */
    async deleteByDocId(uid: string, id: string) {
        const targetQuery = this.collection.where('uid', '==', uid)
        const countData = await targetQuery.count().get()
        const count: number = countData.data().count
        if (count == 0) {
            throw 'uid不存在'
        }
        await this.collection.doc(id).delete()
        return true
    }
}