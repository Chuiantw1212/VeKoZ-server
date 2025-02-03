import DataAccess from './DataAccess'
import type { IDataAccessAdapters } from '../entities/dataAccess'

export default class EventModel extends DataAccess {
    constructor(data: IDataAccessAdapters) {
        super(data)
    }
}