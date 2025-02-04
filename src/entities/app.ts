/**
 * 為了開發維護方便的Interface，在開發方法上無特別理論用意。
 */
import MetaService from "../domain/services/Meta.service"
import EventService from "../domain/services/Event.service"
import EventTemplateService from "../domain/services/EventTemplate.service"
import OrganizationService from '../domain/services/Organization.service'
import AuthService from '../domain/services/Auth.service'
import AccomdationService from '../domain/services/Place.service'

export interface ILocals {
    [key: string]: any
    startupTime?: number,
    MetaService: MetaService,
    EventService: EventService,
    OrganizationService: OrganizationService,
    AuthService: AuthService,
    AccomdationService: AccomdationService,
    EventTemplateService: EventTemplateService
}

export interface IApp {
    locals: ILocals
}

export function extractLocals(request: Request): ILocals | any {
    if ("locals" in request) {
        const locals: ILocals = request.locals as ILocals
        return locals
    }
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