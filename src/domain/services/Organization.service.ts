import OrganizationModel from '../Organization.model'
import OrganizationMemberModel from '../OrganizationMember.model';
import EventModel from '../Event.model';
import OfferModel from '../OfferModel';
import EventTemplateModel from '../EventTemplate.model';
import EventTemplateDesignModel from '../EventTemplateDesign.model';
import EventDesignModel from '../EventDesign.model';
import { IEvent } from '../../entities/event';
import type { IOrganization, IOrganizationMember } from '../../entities/organization';

interface Idependency {
    organizationModel: OrganizationModel;
    organizationMemberModel: OrganizationMemberModel
    eventModel: EventModel,
    offerModel: OfferModel,
    eventTemplateModel: EventTemplateModel;
    eventTemplateDesignModel: EventTemplateDesignModel,
    eventDesignModel: EventDesignModel,
}

export default class OrganizationService {
    protected organizationModel: OrganizationModel
    protected organizationMemberModel: OrganizationMemberModel
    private eventModel: EventModel
    private offerModel: OfferModel
    private eventTemplateDesignModel: EventTemplateDesignModel
    private eventTemplateModel: EventTemplateModel
    private eventDesignModel: EventDesignModel

    constructor(dependency: Idependency) {
        this.organizationModel = dependency.organizationModel
        this.organizationMemberModel = dependency.organizationMemberModel
        this.eventModel = dependency.eventModel
        this.offerModel = dependency.offerModel
        this.eventTemplateModel = dependency.eventTemplateModel
        this.eventTemplateDesignModel = dependency.eventTemplateDesignModel
        this.eventDesignModel = dependency.eventDesignModel
    }

    /**
     * 新增組織
     * @param uid 
     * @param founder 
     * @returns 
     */
    async newItem(uid: string, founder: IOrganizationMember) {
        const defaultOrganization: IOrganization = {
            sameAs: [], // 必要
            name: founder.organizationName,
            email: founder.email,
        }
        const newOrganization = await this.organizationModel.createOrganization(uid, defaultOrganization) as IOrganization
        founder.organizationId = newOrganization.id
        await this.organizationMemberModel.addMember(uid, founder)
        return newOrganization
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
        if (!organization.id) {
            throw '更新組織資料毀損,找不到組織識別碼'
        }

        // 更新Blobs
        const tempLogo = organization.image ?? organization.logo // 重要！共用了套版的名稱
        const tempBanner = organization.banner
        delete organization.logo
        delete organization.banner
        delete organization.image // 重要！共用了套版的名稱
        if (tempLogo && typeof tempLogo !== 'string') {
            const publicUrl: string = await this.organizationModel.storeLogo(organization.id, tempLogo)
            organization.logo = publicUrl
            // 更新Event Organizer Logo
            const eventList: IEvent[] = await this.eventModel.queryEventList({
                organizerId: organization.id,
            })
            eventList.forEach((event: IEvent) => {
                this.eventModel.mergeEventById(uid, String(event.id), {
                    organizerLogo: publicUrl,
                })
            })
        }
        if (tempBanner && typeof tempBanner !== 'string') {
            const publicUrl: string = await this.organizationModel.storeBanner(organization.id, tempBanner)
            organization.banner = publicUrl
        }
        const count = await this.organizationModel.mergeOrganizationById(uid, organization.id, organization)

        // 更新連動Model
        this.organizationMemberModel.setMembersByOrgnaizationId(uid, {
            organizationName: organization.name,
            organizationLogo: organization.logo, // 前面已更新過
            organizationId: organization.id,
        })
        this.eventTemplateModel.mergeTemplateByOrganizerId(uid, organization.id, {
            organizerName: organization.name,
            organizerLogo: organization.logo, // 前面已更新過
        })
        // Offer Model
        this.offerModel.updateOfferGroupByOffererId(uid, organization.id, {
            offererName: organization.name,
        })
        this.offerModel.updateOfferGroupBySellerId(uid, organization.id, {
            sellerName: organization.name,
        })
        // DesignModel
        this.eventTemplateDesignModel.setByOrganizationId(uid, organization.id, {
            organizationName: organization.name,
        })
        this.eventDesignModel.setByOrganizationId(uid, organization.id, {
            organizationName: organization.name,
        })
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
     * 刪除組織
     * @param id 
     * @returns 
     */
    async deleteItem(uid: string, id: string) {
        await this.organizationModel.deleteItem(uid, id)
        const count = await this.organizationMemberModel.deleteByOrganizationId(uid, id)
        return count
    }
}