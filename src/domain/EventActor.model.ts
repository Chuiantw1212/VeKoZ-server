import DataAccess from './DataAccess'
import type { IDataAccessAdapters } from '../entities/dataAccess'

export default class EventActorModel extends DataAccess {
    constructor(data: IDataAccessAdapters) {
        super(data)
    }
}