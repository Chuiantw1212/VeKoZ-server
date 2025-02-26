import type { IOptionsItem, } from '../entities/select'
import { Query, QuerySnapshot, DocumentReference, DocumentData, } from 'firebase-admin/firestore'
import type { IModelPorts } from '../ports/out.model'
import FirestoreAdapter from '../adapters/Firestore.out'
import { ICrudOptions } from '../ports/out.crud'
import { ISelectDocData } from '../entities/select'

export default class SelectModel extends FirestoreAdapter {
    constructor(data: IModelPorts) {
        super(data)
    }

    async getOptionsByKey(key: string): Promise<IOptionsItem[]> {
        const optoins: ICrudOptions = {
            count: {
                absolute: 1
            }
        }
        const selectDocData = await super.getItemsByQuery([['key', '==', key]], optoins) as ISelectDocData[]
        return selectDocData[0].options
    }
}