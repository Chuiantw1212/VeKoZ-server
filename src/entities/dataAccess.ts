import type { CollectionReference, } from 'firebase-admin/firestore'

export interface IDataAccessAdapters {
    noSQL?: CollectionReference
    SQL?: any
}
