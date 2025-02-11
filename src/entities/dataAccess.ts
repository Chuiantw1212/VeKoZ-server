import type { CollectionReference, } from 'firebase-admin/firestore'

export interface IFirestoreAdapters {
    collection?: CollectionReference,
    publicBucket?: any,
    privateBucket?: any,
}