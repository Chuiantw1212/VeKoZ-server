import { IUserFollow, IUserFollowQuery } from '../../entities/userFollow';
import UserFollowModel from '../UserFollow.model';
import UserModel from '../User.model';

interface Idependency {
    userFollowModel: UserFollowModel;
    userModel: UserModel
}

export default class EventTemplateService {
    private userFollowModel: UserFollowModel
    private userModel: UserModel

    constructor(dependency: Idependency) {
        this.userFollowModel = dependency.userFollowModel
        this.userModel = dependency.userModel
    }

    async addNewFollow(uid: string, userFollow: IUserFollow) {
        if (!userFollow.followeeId || !userFollow.followeeSeoName) {
            throw 'addNewFollow資料不全'
        }
        const addedUserFollow = await this.userFollowModel.addNewFollow(uid, userFollow)
        this.userFollowModel.countFollowers(userFollow).then(count => {
            this.userModel.setUserFollowers(String(userFollow.followeeId), count)
        })
        return addedUserFollow
    }

    async checkFollowed(query: IUserFollowQuery) {
        const count = await this.userFollowModel.checkFollowed(query)
        return count
    }

    async deleteUserFollow(query: IUserFollowQuery) {
        if (!query.followeeSeoName) {
            throw 'addNewFollow資料不全'
        }
        const count = await this.userFollowModel.deleteUserFollow(query)
        this.userFollowModel.countFollowers(query).then(count => {
            this.userModel.setUserFollowers(String(query.followeeId), count)
        })
        return count
    }
}