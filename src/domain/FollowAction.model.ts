import VekozModel from '../adapters/VekozModel.out'
import type { IModelPorts } from '../ports/out.model'
// import type { IEvent, IEventQuery } from '../entities/event'
// import { ICrudOptions } from '../ports/out.crud'

export default class FollowAction extends VekozModel {
    constructor(data: IModelPorts) {
        super(data)
    }

    async addNewFollow() {
        
    }
}