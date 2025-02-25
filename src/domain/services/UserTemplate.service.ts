import UserModel from '../User.model'
import UserTemplateModel from '../UserTemplate.model';
import type { IUser, IUserPreference } from '../../entities/user';

interface Idependency {
    userModel: UserModel;
    userTemplateModel: UserTemplateModel
}
export default class UserService {
    protected userModel: UserModel
    protected userTemplateModel: UserTemplateModel

    constructor(dependency: Idependency) {
        const {
            userModel,
            userTemplateModel,
        } = dependency
        this.userModel = userModel
        this.userTemplateModel = userTemplateModel
    }

    async getUserTemplate(id: string) {

    }
}