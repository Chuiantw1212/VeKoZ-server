import { Storage } from "firebase-admin/storage"
import { CollectionReference } from "firebase-admin/firestore"
import BlobAdapter from "../adapters/BlobAdapter.out";

export interface IModelPorts {
    collection?: CollectionReference,
    publicBucket?: BlobAdapter,
    privateBucket?: BlobAdapter,
}

export interface IBlob {
    type: string;
    buffer: Buffer,
}