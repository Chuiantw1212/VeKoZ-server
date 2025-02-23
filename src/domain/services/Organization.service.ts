import OrganizationModel from '../Organization.model'
import OrganizationMemberModel from '../OrganizationMember.model';
import EventModel from '../Event.model';
import OfferModel from '../OfferModel';
import EventTemplateDesignModel from '../EventTemplateDesign.model';
import EventDesignModel from '../EventDesign.model';

import { IEvent } from '../../entities/event';
import type { IOrganization, IOrganizationMember } from '../../entities/organization';

interface Idependency {
    organizationModel: OrganizationModel;
    organizationMemberModel: OrganizationMemberModel
    eventModel: EventModel,
    offerModel: OfferModel,
    eventTemplateDesignModel: EventTemplateDesignModel,
    eventDesignModel: EventDesignModel,
}

export default class OrganizationService {
    protected organizationModel: OrganizationModel
    protected organizationMemberModel: OrganizationMemberModel
    protected eventModel: EventModel
    protected offerModel: OfferModel
    protected eventTemplateDesignModel: EventTemplateDesignModel
    protected eventDesignModel: EventDesignModel

    constructor(dependency: Idependency) {
        this.organizationModel = dependency.organizationModel
        this.organizationMemberModel = dependency.organizationMemberModel
        this.eventModel = dependency.eventModel
        this.offerModel = dependency.offerModel
        this.eventTemplateDesignModel = dependency.eventTemplateDesignModel
        this.eventDesignModel = dependency.eventDesignModel
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
    async updateOrganization(uid: string, organization: IOrganization) {
        const count = await this.organizationModel.mergeOrganizationById(uid, organization.id, organization)
        this.offerModel.updateOfferGroupByOffererId(uid, organization.id, {
            offererName: organization.name,
        })
        this.offerModel.updateOfferGroupBySellerId(uid, organization.id, {
            sellerName: organization.name,
        })
        this.eventTemplateDesignModel.setByOrganizationId()
        return count
    }

    /**
     * 取得列表
     * @returns 
     */
    async getOrganizationList(uid: string,) {
        const list: IOrganization[] = await this.organizationModel.getOrganizationList(uid)
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