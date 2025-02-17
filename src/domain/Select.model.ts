import type { IOptionsItem, } from '../entities/select'
import { Query, QuerySnapshot, DocumentReference, DocumentData, } from 'firebase-admin/firestore'
import type { IModelPorts } from '../ports/out.model'
import FirestoreAdapter from '../adapters/Firestore.adapter'
import { ICrudOptions } from '../ports/out.crud'
import { ISelectDocData } from '../entities/select'

export default class SelectModel extends FirestoreAdapter {
    constructor(data: IModelPorts) {
        super(data)
    }

    async getOptionsById(id: string): Promise<IOptionsItem[]> {
        const selectDocData = await super.getItemById(id) as ISelectDocData
        return selectDocData.options
    }
}