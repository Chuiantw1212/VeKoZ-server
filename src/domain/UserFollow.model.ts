import VekozModel from '../adapters/VekozModel.out'
import { IUserFollow, IUserFollowQuery } from '../entities/userFollow'
import type { IModelPorts } from '../ports/out.model'

export default class UserFollowModel extends VekozModel {
    constructor(data: IModelPorts) {
        super(data)
    }

    async addNewFollow(uid: string, userFollow: IUserFollow) {
        const wheres = [['id', '==', userFollow.id], ['followeeId', '==', userFollow.followeeId]]
        const query = await super.getQuery(wheres)
        await super.checkQueryCount(query, {
            absolute: 0,
        })
        const addedFollowed = await super.createItem(uid, userFollow)
        return addedFollowed
    }

    async checkFollowed(userFollow: IUserFollowQuery) {
        const wheres = [['uid', '==', userFollow.uid], ['followeeSeoName', '==', userFollow.followeeSeoName]]
        const query = await super.getQuery(wheres)
        const count = await super.checkQueryCount(query)
        return count
    }
}