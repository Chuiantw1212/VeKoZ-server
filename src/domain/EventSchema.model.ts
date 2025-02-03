import DataAccess from './DataAccess'
import type { IDataAccessAdapters } from '../entities/dataAccess'

export default class EventSchemaModel extends DataAccess {
    constructor(data: IDataAccessAdapters) {
        super(data)
    }
}