import DataAccess from './DataAccess'
import type { IDataAccessAdapters } from '../entities/dataAccess'

export default class EventTemplateDesignModel extends DataAccess {
    constructor(data: IDataAccessAdapters) {
        super(data)
    }
}