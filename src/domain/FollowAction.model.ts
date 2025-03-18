import VekozModel from '../adapters/VekozModel.out'
import { IFollowAction } from '../entities/followAction'
import type { IModelPorts } from '../ports/out.model'

export default class FollowActionModel extends VekozModel {
    constructor(data: IModelPorts) {
        super(data)
    }

    async addNewFollow(uid: string, followaction: IFollowAction) {
        const addedFollowed = await super.createItem(uid, followaction)
    }
}