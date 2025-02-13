import UserModel from '../User.model'
import UserPreferenceModel from '../UserPreference.model';
import type { IUser, IUserPreference } from '../../entities/user';

interface Idependency {
    userModel: UserModel;
    userPreferenceModel: UserPreferenceModel
}
export default class UserService {
    protected userModel: UserModel
    protected userPreferenceModel: UserPreferenceModel

    constructor(dependency: Idependency) {
        const {
            userModel,
            userPreferenceModel,
        } = dependency
        this.userModel = userModel
        this.userPreferenceModel = userPreferenceModel
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
    async addUser(uid: string, user: IUser) {
        const createdUser: IUser = await this.userModel.createUser(uid, user)
        if (createdUser.id) {
            const userPreference: IUserPreference = {
                id: createdUser.id,
                userType: 'attendee',
                event: {
                    calendarViewType: 'dayGridMonth',
                    organizationIds: [],
                }
            }
            user.preference = userPreference
        }
        return user
    }
}