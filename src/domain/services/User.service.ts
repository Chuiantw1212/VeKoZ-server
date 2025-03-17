import UserModel from '../User.model'
import UserPreferenceModel from '../UserPreference.model';
import UserDesignModel from '../UserDesign.model';
import type { IUser, IUserDesign, IUserPreference } from '../../entities/user';
import { IBlob } from '../../ports/out.model';
import { DecodedIdToken } from 'firebase-admin/auth';

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

    async uploadUserAvatar(uid: string, avatar: IBlob): Promise<string> {
        const user = await this.getUserByUid(uid)
        if (user) {
            const publicUrl = await this.userModel.uploadAvatar(String(user.id), avatar)
            // await this.userModel.setUser(uid, {
            //     avatar: publicUrl,
            // })
            return publicUrl
        }
        return ''
    }

    /**
     * 抓取公開資料
     * @param field id或是seoName
     * @param value 
     * @returns 
     */
    async getUserPublicInfo(field: string, value: string) {
        const user: IUser = await this.userModel.getPublicInfo(field, value)
        if (!user.id) {
            return 0
        }
        if (user.designIds) {
            const promises = user.designIds.map(id => {
                return this.userDesignModel.getUserDesignById(id)
            })
            const userDesigns: IUserDesign[] = await Promise.all(promises)
            user.designs = userDesigns
        }
        return user
    }

    /**
     * 用uid找出包含偏好+個人資料，如果是被id查詢，就不需要這些不必要的非公開資料
     * @param uid 
     * @returns 
     */
    async getUserByUid(uid: string) {
        const user: IUser = await this.userModel.getUserByUid(uid)
        if (!user) {
            return
        }
        if (user.id) {
            // 抓取preference
            const userPreference = await this.userPreferenceModel.getPreference(user.id)
            user.preference = userPreference
        }
        // 抓取designs
        const userDesignIds = user.designIds
        if (userDesignIds) {
            const promises = userDesignIds.map(designId => {
                return this.userDesignModel.getUserDesignById(designId)
            })
            const userDesigns = await Promise.all(promises)
            user.designs = userDesigns
        }
        return user
    }

    async patchUserPreference(uid: string, preference: IUserPreference): Promise<number> {
        const count = await this.userPreferenceModel.setPreference(uid, preference)
        if (!count) {
            const user = await this.userModel.getUserByUid(uid)
            const defualtPreference = this.getDefaultPreference(user)
            this.userPreferenceModel.createPreference(uid, defualtPreference)
        }
        return count
    }

    /**
     * 新增使用者
     * @param user 
     */
    async addUser(userIdToken: DecodedIdToken) {
        /**
         * https://schema.org/Person
         */
        const newUser: IUser = {
            emailVerified: userIdToken.email_verified,
            name: userIdToken.name ?? '',
            email: userIdToken.email ?? '',
            telephone: userIdToken.phoneNumber ?? '',
            avatar: userIdToken.picture ?? '',
            providerId: userIdToken.firebase.sign_in_provider,
            uid: userIdToken.uid,
        }
        const createdUser: IUser = await this.userModel.createUser(String(newUser.uid), newUser)
        if (createdUser.id) {
            const userPreference: IUserPreference = this.getDefaultPreference(createdUser)
            this.userPreferenceModel.createPreference(userIdToken.uid, userPreference)
            newUser.preference = userPreference
            this.userModel.setUser(userIdToken.uid, {
                seoName: createdUser.id,
            })
        }
        return newUser
    }

    private getDefaultPreference(user: IUser): IUserPreference {
        return {
            id: user.id,
            menuType: 'attendee',
            event: {
                calendarViewType: 'dayGridMonth',
                organizerIds: [],
                organizerId: '',
            }
        }
    }

    /**
    * 新增使用者
    * @param user 
    */
    async addUserDesigns(uid: string, designs: IUserDesign[]) {
        const user = await this.userModel.getUserByUid(uid)
        if (user.designIds) {
            throw '設計已存在'
        }
        const userPatch: IUser = {}
        const designPromies = designs.map(async design => {
            const designPatch = this.extractUserPatch(design)
            Object.assign(userPatch, designPatch)
            design.userId = user.id
            const createdDesign = await this.userDesignModel.createDesign(uid, design)
            return createdDesign
        })
        const createdDesigns = await Promise.all(designPromies)
        const designIds = createdDesigns.map(design => design.id)
        const count = await this.setUser(uid, {
            ...userPatch,
            designIds,
        })
        return count
    }

    /**
     * 新增更新連動主檔
     * @param design 
     * @returns 
     */
    extractUserPatch(design: IUserDesign) {
        if (!design.formField) {
            return {}
        }
        const userPatch: IUser = {}
        switch (design.formField) {
            case 'description':
            case 'avatar':
            case 'name':
            default: {
                userPatch[design.formField] = design.value
                break
            }
        }
        return userPatch
    }

    /**
     * 要確認所以獨立出來
     * @param uid 
     * @param user 
     * @returns 
     */
    async setUserSeo(uid: string, user: IUser) {
        if (user.seoName) {
            const isValid = await this.userModel.checkSeoNameAvailable(uid, user.seoName)
            if (!isValid) {
                throw '變更失敗，該網址已存在'
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
        // delete user.seoName
        // if (user.seoName) {
        //     throw '該網址已存在'
        //     const isValid = await this.userModel.checkSeoNameAvailable(uid, user.seoName)
        //     if (!isValid) {
        //     }
        // }
        // // set data
        if (user.seoName) {
            const isValid = await this.userModel.checkSeoNameAvailable(uid, user.seoName)
            if (!isValid) {
                throw '變更失敗，該網址已存在'
            }
        }
        const count = await this.userModel.setUser(uid, user,)
        return count
    }
}