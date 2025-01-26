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
            return doc.data()
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
        data.uid = uid // IMPORTANT 否則新資料會是null
        this.collection.doc(data.id).set(data)
        return data
    }

    /**
     * 取代現有的Document
     * @param uid user id
     * @param data 
     */
    async setSingleDoc(uid: string, data: any) {
        const singleDocSnapshot = await this.checkSingleDoc(uid)
        singleDocSnapshot.ref.set(data)
    }
    /**
     * 合併現有的Document
     * @param uid user id
     * @param data 
     */
    async mergeSingleDoc(uid: string, data: any) {
        const singleDocSnapshot = await this.checkSingleDoc(uid)
        singleDocSnapshot.ref.set(data, {
            merge: true
        })
    }
    /**
     * 取代現有的Document某個欄位
     * @param uid user id
     * @param data 
     */
    async mergeSingleDocField(uid: string, field: string, data: any) {
        const singleDocSnapshot = await this.checkSingleDoc(uid)
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
    async checkSingleDoc(uid: string) {
        const targetQuery = this.collection.where('uid', '==', uid)
        const countData = await targetQuery.count().get()
        const count: number = countData.data().count
        if (count == 0) {
            throw 'uid不存在'
        }
        if (count > 1) {
            throw '現有資料重複uid'
        }
        const doc = (await targetQuery.get()).docs[0]
        return doc
    }
}