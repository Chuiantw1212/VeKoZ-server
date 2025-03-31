import VekozModel from '../adapters/VekozModel.out'
import { IUserFollow, IUserFollowQuery } from '../entities/userFollow'
import { ICrudOptions } from '../ports/out.crud'
import type { IModelPorts } from '../ports/out.model'

export default class UserFollowModel extends VekozModel {
    constructor(data: IModelPorts) {
        super(data)
    }

    /**
     * C
     * @param uid 
     * @param userFollow 
     * @returns 
     */
    async addNewFollow(uid: string, userFollow: IUserFollow) {
        const wheres = [['id', '==', userFollow.id], ['followeeSeoName', '==', userFollow.followeeSeoName]]
        const query = await super.getQuery(wheres)
        await super.checkQueryCount(query, {
            absolute: 0,
        })
        const addedFollowed = await super.createItem(uid, userFollow)
        return addedFollowed
    }

    /**
     * R
     * @param query 
     * @returns 
     */
    async queryFollowList(query: IUserFollowQuery) {
        const wheres = [['uid', '==', query.uid], ['id', '==', query.id]]
        const followList = await super.getItemsByQuery(wheres)
        return followList
    }

    /**
     * R
     * @param userFollow 
     * @returns 
     */
    async countFollowers(userFollow: IUserFollow) {
        const wheres = [['followeeSeoName', '==', userFollow.followeeSeoName]]
        const query = await super.getQuery(wheres)
        const count = await super.checkQueryCount(query)
        return count
    }

    /**
     * R
     * @param userFollow 
     * @returns 
     */
    async checkFollowed(userFollow: IUserFollowQuery) {
        const wheres = [['uid', '==', userFollow.uid], ['followeeSeoName', '==', userFollow.followeeSeoName]]
        const query = await super.getQuery(wheres)
        const count = await super.checkQueryCount(query, {
            range: [0, 1]
        })
        return count
    }

    /**
     * R: 用seoName取得follow action
     * @param uid 
     * @param followeeSeoName 
     * @returns 
     */
    async getFollowActionBySeoName(uid: string, query: IUserFollowQuery) {
        if (!query.followeeSeoName) {
            throw 'getFollowActionBySeoName資料不全'
        }
        const wheres = [['uid', '==', uid]]
        switch (query.followeeType) {
            case 'user': {
                wheres.push(['seoName', '==', query.followeeSeoName])
                break;
            }
            case 'organization': {
                wheres.push(['id', '==', query.followeeSeoName])
                break;
            }
            default: {
                throw 'getFollowActionBySeoName資料不全'
            }
        }
        const followActions = await super.getItemsByQuery(wheres, {
            count: {
                absolute: 1
            }
        })
        return followActions[0]
    }

    /**
     * U
     * @param uid 
     * @param userFollow 
     * @returns 
     */
    async setUserFollow(uid: string, userFollow: IUserFollow) {
        const options: ICrudOptions = {
            count: {
                absolute: 1,
            }
        }
        const wheres = [['uid', '==', userFollow.uid], ['followeeId', '==', userFollow.followeeId]]
        const count = await super.setItemsByQuery(wheres, userFollow, options)
        return count
    }

    /**
     * D
     * @param userFollow 
     * @returns 
     */
    async deleteUserFollow(userFollow: IUserFollowQuery) {
        if (!userFollow.followeeSeoName) {
            throw 'deleteUserFollow資料不全'
        }
        const wheres = [['uid', '==', userFollow.uid], ['followeeSeoName', '==', userFollow.followeeSeoName]]
        const count = await super.deleteItemsByQuery(wheres, {
            count: {
                absolute: 1,
            }
        })
        return count
    }
}