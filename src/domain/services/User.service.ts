import UserModel from '../User.model'
import UserPreferenceModel from '../UserPreference.model';
import UserDesignModel from '../UserDesign.model';
import type { IUser, IUserDesign, IUserPreference } from '../../entities/user';

interface Idependency {
    userModel: UserModel
    userPreferenceModel: UserPreferenceModel
    userDesignModel: UserDesignModel
}
export default class UserService {
    protected userModel: UserModel
    protected userPreferenceModel: UserPreferenceModel
    protected userDesignModel: UserDesignModel

    constructor(dependency: Idependency) {
        const {
            userModel,
            userPreferenceModel,
            userDesignModel,
        } = dependency
        this.userModel = userModel
        this.userPreferenceModel = userPreferenceModel
        this.userDesignModel = userDesignModel
    }

    async getUserBySeoName(uid: string) {
        const user: IUser = await this.userModel.getUserBySeoName(uid)
        return user
    }

    /**
     * 用uid找出包含偏好+個人資料
     * @param uid 
     * @returns 
     */
    async getUserByUid(uid: string) {
        /**
         * 如果是被id查詢，就不需要這些不必要的非公開資料
         */
        const user: IUser = await this.userModel.getUserByUid(uid)
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

    /**
    * 新增使用者
    * @param user 
    */
    async addUserDesigns(uid: string, designs: IUserDesign[]) {
        const designPromies = designs.map(async design => {
            const createdDesign = await this.userDesignModel.createDesign(uid, design)
            return createdDesign
        })
        const createdDesigns = await Promise.all(designPromies)
        const designIds = createdDesigns.map(design => design.id)
        const count = await await this.setUser(uid, {
            designIds,
        })
        return count
    }

    /**
     * 要確認所以獨立出來
     * @param uid 
     * @param user 
     * @returns 
     */
    async setUserSeoName(uid: string, user: IUser) {
        if (user.seoName) {
            const isValid = await this.userModel.checkSeoNameAvailable(uid, user.seoName)
            if (!isValid) {
                throw '該網址已存在'
            }
        }
        const count = await this.userModel.setUser(uid, user,)
        return count
    }

    /**
     * 合併用戶資訊
     */
    async setUser(uid: string, user: IUser) {
        // check seo availability
        delete user.seoName
        // if (user.seoName) {
        //     throw '該網址已存在'
        //     const isValid = await this.userModel.checkSeoNameAvailable(uid, user.seoName)
        //     if (!isValid) {
        //     }
        // }
        // // set data
        const count = await this.userModel.setUser(uid, user,)
        return count
    }
}