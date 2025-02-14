import { Storage } from "firebase-admin/storage"
import { CollectionReference } from "firebase-admin/firestore"

export interface IModelPorts {
    collection?: CollectionReference,
    publicBucket?: ReturnType<Storage['bucket']>,
    privateBucket?: ReturnType<Storage['bucket']>,
}