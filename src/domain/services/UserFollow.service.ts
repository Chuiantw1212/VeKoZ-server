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

    async checkFollowed(query: IUserFollowQuery) {
        if (!query.followeeSeoName) {
            throw 'checkFollowed資料不全'
        }
        const count = await this.userFollowModel.checkFollowed(query)
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