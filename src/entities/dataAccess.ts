import type { CollectionReference, } from 'firebase-admin/firestore'

export interface IFirestoreAdapters {
    collection?: CollectionReference,
    publicBucket?: any,
    privateBucket?: any,
}

export interface ICrudOptions {
    uid?: string, // 資料權限控制
    count?: IDataCountOptions,
    slice?: [number, number] | number
    fields?: string[],
    merge?: boolean,
    limit?: number,
    sort?: string,
}

export interface IDataCountOptions {
    min?: number,
    max?: number,
    absolute?: number,
    range?: number[],
}

export interface IQuery {
    field: string,
    operator: string,
    value: any,
}


export interface INoSQL extends CollectionReference {

}
