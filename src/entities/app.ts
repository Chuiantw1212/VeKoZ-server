/**
 * 為了開發維護方便的Interface，在開發方法上無特別理論用意。
 */
import MetaService from "../domain/services/Meta.service"
import EventService from "../domain/services/Event.service"
import EventTemplateService from "../domain/services/EventTemplate.service"
import OrganizationService from '../domain/services/Organization.service'
import OrganizationMemberService from "../domain/services/OrganizationMember.service"
import AuthService from '../domain/services/Auth.service'
import PlaceService from '../domain/services/Place.service'
import UserService from "../domain/services/User.service"
import UserDesignService from "../domain/services/UserDesign.service"
import GoogleService from '../domain/services/Google.service'
import OfferService from "../domain/services/Offer.service"

export interface ILocals {
    [key: string]: any
    startupTime?: number,
    MetaService: MetaService,
    EventService: EventService,
    OrganizationService: OrganizationService,
    OrganizationMemberService: OrganizationMemberService,
    AuthService: AuthService,
    PlaceService: PlaceService,
    EventTemplateService: EventTemplateService,
    UserService: UserService,
    UserDesignService: UserDesignService,
    GoogleService: GoogleService
    OfferService: OfferService
}

export interface IApp {
    locals: ILocals
}

class AccessGlobalService {
    locals: ILocals = {} as any
    set(name: string, value: any) {
        this.locals[name] = value
    }
    get(name: string) {
        return this.locals[name]
    }
}
export default new AccessGlobalService()