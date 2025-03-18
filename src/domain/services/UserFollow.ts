import { IUserFollow } from '../../entities/userFollow';
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
}