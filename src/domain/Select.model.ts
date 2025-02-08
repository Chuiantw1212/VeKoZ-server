import type { IOptionsItem, } from '../entities/select'
import { Query, QuerySnapshot, DocumentReference, DocumentData, } from 'firebase-admin/firestore'
import type { IFirestoreAdapters } from '../entities/dataAccess'
import Firestore from '../adapters/Firestore.out'

export default class SelectModel extends Firestore {
    constructor(data: IFirestoreAdapters) {
        super(data)
    }
    async getOptionsByKey(key: string,): Promise<IOptionsItem[]> {
        try {
            if (!this.collection) {
                throw this.error.collectionIsNotReady
            }
            const keyQuery: Query = this.collection.where('key', '==', key).max(1)
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
        if (!this.collection) {
            throw this.error.collectionIsNotReady
        }
        const keyQuery: Query = this.collection.where('key', '==', key)
        const countData: DocumentData = await keyQuery.count().get()
        const count: number = countData.data().count
        switch (count) {
            case 0: {
                this.collection.add({
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