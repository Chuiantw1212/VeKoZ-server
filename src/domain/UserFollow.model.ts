import VekozModel from '../adapters/VekozModel.out'
import { IUserFollow } from '../entities/userFollow'
import type { IModelPorts } from '../ports/out.model'

export default class UserFollowModel extends VekozModel {
    constructor(data: IModelPorts) {
        super(data)
    }

    async addNewFollow(uid: string, followaction: IUserFollow) {
        const addedFollowed = await super.createItem(uid, followaction)
        return addedFollowed
    }
}