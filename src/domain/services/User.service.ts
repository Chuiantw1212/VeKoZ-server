import UserModel from '../User.model'
import type { IUser } from '../../entities/user';
import { DecodedIdToken, UserInfo } from 'firebase-admin/auth';

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

    async getUser(uid: string) {
        const user = await this.userModel.getUser(uid)
        return user
    }

    /**
     * 新增使用者
     * @param user 
     */
    addUser(userIdToken: DecodedIdToken) {
        const uid = userIdToken.uid
        const userInfo: IUser = {
            uid: userIdToken.uid,
            displayName: '',
            email: '',
            photoURL: '',
            phoneNumber: '',
            providerId: '',
        }
        return this.userModel.createUser(uid, user)
    }
}