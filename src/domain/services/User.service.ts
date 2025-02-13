import UserModel from '../User.model'
import UserPreferenceModel from '../UserPreference.mode';
import type { IUser, IUserPreference } from '../../entities/user';
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
        const user: IUser = await this.userModel.getUser(uid)
        if (user.id) {
            const userPreference = await this.userPreferenceModel.getPreference(user.id)
            user.preference = userPreference
        }
        return user
    }

    async patchUserPreference(uid: string, preference: IUserPreference): Promise<number> {
        const count = await this.userPreferenceModel.setPreference(uid, preference)
        return count
    }

    /**
     * 新增使用者
     * @param user 
     */
    async addUser(uid: string, userInfo: IUser) {
        const createdUser: IUser = await this.userModel.createUser(uid, userInfo)
        if (createdUser.id) {
            const userPreference: IUserPreference = {
                id: createdUser.id,
                userType: 'attendee',
                event: {
                    calendarView: 'dayGridMonth',
                    organizationIds: [],
                }
            }
            userInfo.preference = userPreference
        }
        return userInfo
    }
}