import type { IOptionsItem, } from '../entities/meta'
import { Query, QuerySnapshot, DocumentReference, DocumentData, } from 'firebase-admin/firestore'
import type { IModelPorts } from '../ports/out.model'
import VekozModel from '../adapters/VekozModel.out'
import { ICrudOptions } from '../ports/out.crud'
import { ISelectDocData } from '../entities/meta'

export default class SelectModel extends VekozModel {
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