import UserModel from '../User.model'
import UserDesignModel from '../UserDesign.model';
import type { IUser, IUserDesign, IUserPreference } from '../../entities/user';

interface Idependency {
    userModel: UserModel;
    userDesignModel: UserDesignModel
}

export default class UserService {
    protected userModel: UserModel
    protected userDesignModel: UserDesignModel

    constructor(dependency: Idependency) {
        const {
            userModel,
            userDesignModel,
        } = dependency
        this.userModel = userModel
        this.userDesignModel = userDesignModel
    }

    async getUserDesign(id: string) {

    }

    async patchUserDesign(uid: string, userDesign: IUserDesign) {
        const userPatch: IUser = {}
        switch (userDesign.formField) {
            case "description": {
                userPatch[userDesign.formField] = userDesign.value
            }
            case "avatar": {
                if (typeof userDesign.value !== 'string') {
                    const publicUrl = await this.userDesignModel.uploadAvatar(userDesign)
                    userPatch.avatar = publicUrl
                }
            }
            default: {
                // do nothing
            }
        }
        if (Object.keys(userPatch).length) {
            this.userModel.setUser(uid, userPatch)
        }
        const count = await this.userDesignModel.setUserDesignById(uid, String(userDesign.id), userDesign)
        return count
    }
}