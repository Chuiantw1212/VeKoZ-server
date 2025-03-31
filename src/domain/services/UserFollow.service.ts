import { IUserFollow, IUserFollowQuery } from '../../entities/userFollow';
import UserFollowModel from '../UserFollow.model';
import OrganizationMemberModel from '../OrganizationMember.model';
import UserPreferenceModel from '../UserPreference.model';
import UserModel from '../User.model';
import OrganizationModel from '../Organization.model';

interface Idependency {
    userFollowModel: UserFollowModel;
    userModel: UserModel
    userPreferenceModel: UserPreferenceModel
    organizationModel: OrganizationModel
}

export default class EventTemplateService {
    private userFollowModel: UserFollowModel
    private userModel: UserModel
    private organizationModel: OrganizationModel
    private userPreferenceModel: UserPreferenceModel

    constructor(dependency: Idependency) {
        this.userFollowModel = dependency.userFollowModel
        this.userModel = dependency.userModel
        this.organizationModel = dependency.organizationModel
        this.userPreferenceModel = dependency.userPreferenceModel
    }

    async addNewFollow(uid: string, userFollow: IUserFollow) {
        if (!userFollow.followeeId || !userFollow.followeeSeoName) {
            throw 'addNewFollow資料不全'
        }
        const addedUserFollow = await this.userFollowModel.addNewFollow(uid, userFollow)

        // 加入追蹤者名單
        this.userPreferenceModel.addFollowee(uid, userFollow.followeeId)

        // 更新追蹤者數據
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

    /**
     * R: 判斷用戶是否已經追蹤該單位/人
     * @param query 
     * @returns 
     */
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

        // 刪除follow action
        const deleteCount = await this.userFollowModel.deleteUserFollow(query)

        // 抓出follow action
        this.userFollowModel.getFollowActionBySeoName(String(query.uid), query).then((followAction: IUserFollow) => {
            // 加入追蹤者名單
            this.userPreferenceModel.removeFollowee(String(query.uid), String(followAction.followeeId))
            // 更新被追蹤者的追蹤者人數
            this.userFollowModel.countFollowers(query).then(count => {
                this.userModel.setFollowerCount(String(followAction.followeeId), count)
            })
        })

        return deleteCount
    }
}