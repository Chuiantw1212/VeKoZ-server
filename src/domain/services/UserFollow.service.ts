import { IUserFollow, IUserFollowQuery } from '../../entities/userFollow';
import UserFollowModel from '../UserFollow.model';
import OrganizationMemberModel from '../OrganizationMember.model';
import UserModel from '../User.model';
import OrganizationModel from '../Organization.model';

interface Idependency {
    userFollowModel: UserFollowModel;
    userModel: UserModel
    organizationModel: OrganizationModel
}

export default class EventTemplateService {
    private userFollowModel: UserFollowModel
    private userModel: UserModel
    private organizationModel: OrganizationModel

    constructor(dependency: Idependency) {
        this.userFollowModel = dependency.userFollowModel
        this.userModel = dependency.userModel
        this.organizationModel = dependency.organizationModel
    }

    async addNewFollow(uid: string, userFollow: IUserFollow) {
        if (!userFollow.followeeId || !userFollow.followeeSeoName) {
            throw 'addNewFollow資料不全'
        }
        const addedUserFollow = await this.userFollowModel.addNewFollow(uid, userFollow)
        this.userFollowModel.countFollowers(userFollow).then(count => {
            switch (userFollow.followeeType) {
                case 'user': {
                    this.userModel.setFollowerCount(String(userFollow.followeeId), count)
                    break;
                }
                case 'organization': {
                    this.organizationModel.setFollowerCount(String(userFollow.followeeId), count)
                    break;
                }
                default: {
                    throw 'addNewFollow Type Exception.'
                }
            }
        })
        return addedUserFollow
    }

    async getFollowList(query: IUserFollowQuery) {
        const followList = await this.userFollowModel.queryFollowList(query)
        // // 資料修正機制
        // const promises = followList.map(async (followAction: IUserFollow) => {
        //     if (!followAction.followeeName) {
        //         switch (followAction.followeeType) {
        //             case 'user': {
        //                 const userPublicInfo = await this.userModel.getPublicInfoById(String(followAction.followeeId))
        //                 followAction.followeeName = userPublicInfo.name
        //                 break;
        //             }
        //             case 'organization': {
        //                 break;
        //             }
        //         }
        //     }
        //     return followAction
        // })
        // const fixedList = await Promise.all(promises)
        return followList
    }

    async checkFollowed(query: IUserFollowQuery) {
        if (!query.followeeSeoName) {
            throw 'checkFollowed資料不全'
        }
        const count = await this.userFollowModel.checkFollowed(query)
        return count
    }

    async patchUserFollow(uid: string, userFollow: IUserFollow) {
        const count = await this.userFollowModel.setUserFollow(uid, userFollow)
        return count
    }

    async deleteUserFollow(query: IUserFollowQuery) {
        if (!query.followeeSeoName) {
            throw 'addNewFollow資料不全'
        }
        const count = await this.userFollowModel.deleteUserFollow(query)
        this.userFollowModel.countFollowers(query).then(count => {
            this.userModel.setFollowerCount(String(query.followeeId), count)
        })
        return count
    }
}