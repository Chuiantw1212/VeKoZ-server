import type { CollectionReference, } from 'firebase-admin/firestore'

export interface IDataAccessAdapters {
    noSQL?: CollectionReference,
    SQL?: any,
    publicBucket?: any,
    privateBucket?: any,
}

export interface IDataAccessOptions {
    count?: IDataCountOptions,
    slice?: [number, number] | number
}

export interface IDataCountOptions {
    min?: number,
    max?: number,
    absolute?: number,
}

export interface IQuery {
    field: string,
    operator: string,
    value: any,
}


export interface INoSQL extends CollectionReference {

}
