import { IFollowAction } from '../../entities/followAction';
import FollowActionModel from '../FollowAction.model';

interface Idependency {
    followActionModel: FollowActionModel;
}

export default class EventTemplateService {
    protected followActionModel: FollowActionModel

    constructor(dependency: Idependency) {
        const {
            followActionModel,
        } = dependency
        this.followActionModel = followActionModel
    }

    async addNewFollow(uid: string, followAction: IFollowAction) {
        const addedFollowAction = await this.followActionModel.addNewFollow(uid, followAction)
        return addedFollowAction
    }
}