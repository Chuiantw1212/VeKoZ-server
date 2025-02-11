import UserModel from '../User.model'
import type { IUser } from '../../entities/user';

interface Idependency {
    userModel: UserModel;
}
export default class UserService {
    protected userModel: UserModel = null as any

    constructor(dependency: Idependency) {
        const {
            userModel,
        } = dependency
        this.userModel = userModel
    }

    /**
     * 新增空間
     * @param uid UserUid
     * @param user 
     */
    addUser(uid: string, user: IUser) {
        return this.userModel.createItem(uid, user)
    }
}