import { IUserFollow, IUserFollowQuery } from '../../entities/userFollow';
import UserFollowModel from '../UserFollow.model';

interface Idependency {
    userFollowModel: UserFollowModel;
}

export default class EventTemplateService {
    protected userFollowModel: UserFollowModel

    constructor(dependency: Idependency) {
        const {
            userFollowModel,
        } = dependency
        this.userFollowModel = userFollowModel
    }

    async addNewFollow(uid: string, userFollow: IUserFollow) {
        const addedUserFollow = await this.userFollowModel.addNewFollow(uid, userFollow)
        return addedUserFollow
    }

    async checkFollowed(query: IUserFollowQuery) {
        const count = await this.userFollowModel.checkFollowed(query)
        return count
    }

    async deleteUserFollow(query: IUserFollowQuery) {
        const count = await this.userFollowModel.deleteUserFollow(query)
        return count
    }
}