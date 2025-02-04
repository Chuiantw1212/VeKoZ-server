import DataAccess from './DataAccess'
import type { IDataAccessAdapters } from '../entities/dataAccess'
import { ITemplateDesign } from '../entities/eventTemplate'

export default class EventTemplateModel extends DataAccess {
    constructor(data: IDataAccessAdapters) {
        super(data)
    }

    // patchDesigns(uid: string, designIds: string[]) {
    //     this.setUidDocField
    // }
}