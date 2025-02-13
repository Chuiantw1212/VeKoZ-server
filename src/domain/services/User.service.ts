import UserModel from '../User.model'
import UserPreferenceModel from '../UserPreference.mode';
import type { IUser } from '../../entities/user';
import { DecodedIdToken } from 'firebase-admin/auth';

interface Idependency {
    userModel: UserModel;
    userPreferenceModel: UserPreferenceModel
}
export default class UserService {
    protected userModel: UserModel = null as any
    protected userPreferenceModel: UserPreferenceModel = null as any

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
        return this.userModel.createUser(uid, userInfo)
    }
}