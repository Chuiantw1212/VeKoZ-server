import type { IOrganization, IOrganizationMember } from '../../entities/organization';
import OrganizationModel from '../Organization.model'
import OrganizationMemberModel from '../OrganizationMember.model';
import EventModel from '../Event.model';
import { IEvent } from '../../entities/event';

interface Idependency {
    organizationModel: OrganizationModel;
    organizationMemberModel: OrganizationMemberModel
    eventModel: EventModel
}

export default class OrganizationService {
    protected organizationModel: OrganizationModel
    protected organizationMemberModel: OrganizationMemberModel
    protected eventModel: EventModel

    constructor(dependency: Idependency) {
        const {
            organizationModel,
            organizationMemberModel,
            eventModel
        } = dependency
        this.organizationModel = organizationModel
        this.organizationMemberModel = organizationMemberModel
        this.eventModel = eventModel
    }

    async storeLogo(uid: string, id: string, logo: any) {
        const logoUrl = await this.organizationModel.storeLogo(id, logo)
        const eventListL: IEvent[] = await this.eventModel.queryEventList({
            organizerId: id,
        })
        eventListL.forEach((event: IEvent) => {
            this.eventModel.mergeEventById(uid, String(event.id), {
                organizerLogo: logoUrl,
            })
        })
        return logoUrl
    }

    /**
     * 新增組織
     * @param uid UserUid
     * @param organization 
     */
    async newItem(uid: string, organization: IOrganization) {
        return await this.organizationModel.createOrganization(uid, organization) as IOrganization
    }

    /**
     * 取得組織
     */
    async getItem(id: string) {
        const organizationList = await this.organizationModel.getOrganizationById(id) as IOrganization
        return organizationList
    }

    /**
     * 更新組織
     */
    async mergeUniqueDoc(uid: string, organization: IOrganization) {
        return await this.organizationModel.mergeOrganizationById(uid, organization.id, organization)
    }

    /**
     * 取得列表
     * @returns 
     */
    async getOrganizationList() {
        const list: IOrganization[] = await this.organizationModel.getOrganizationList()
        return list
    }

    /**
     * 取得成員列表
     * @param uid 使用者uid
     * @param organizationId 企業文件Id
     * @returns 
     */
    async getMemberList(uid: string, organizationId: string): Promise<IOrganizationMember[]> {
        const list: IOrganizationMember[] = await this.organizationMemberModel.getMemberList(uid, organizationId) as IOrganizationMember[]
        return list
    }

    /**
     * 刪除組織
     * @param id 
     * @returns 
     */
    async deleteItem(uid: string, id: string) {
        return await this.organizationModel.deleteItem(uid, id)
    }
}