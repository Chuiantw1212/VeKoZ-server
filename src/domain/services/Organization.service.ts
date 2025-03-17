import OrganizationModel from '../Organization.model'
import OrganizationMemberModel from '../OrganizationMember.model';
import EventModel from '../Event.model';
import OfferModel from '../OfferModel';
import EventTemplateModel from '../EventTemplate.model';
import EventTemplateDesignModel from '../EventTemplateDesign.model';
import EventDesignModel from '../EventDesign.model';
import NlpAdapter from '../../adapters/nlp.out';
import { IEvent } from '../../entities/event';
import type { IOrganization, IOrganizationMember, IOrganizationQuery } from '../../entities/organization';
import PlaceModel from '../Place.model';

interface Idependency {
    organizationModel: OrganizationModel;
    organizationMemberModel: OrganizationMemberModel
    eventModel: EventModel,
    offerModel: OfferModel,
    eventTemplateModel: EventTemplateModel;
    eventTemplateDesignModel: EventTemplateDesignModel,
    eventDesignModel: EventDesignModel,
    nlpAdapter: NlpAdapter,
    placeModel: PlaceModel,
}

export default class OrganizationService {
    private organizationModel: OrganizationModel
    private organizationMemberModel: OrganizationMemberModel
    private eventModel: EventModel
    private offerModel: OfferModel
    private eventTemplateDesignModel: EventTemplateDesignModel
    private eventTemplateModel: EventTemplateModel
    private eventDesignModel: EventDesignModel
    private nlpAdapter: NlpAdapter
    private placeModel: PlaceModel

    constructor(dependency: Idependency) {
        this.organizationModel = dependency.organizationModel
        this.organizationMemberModel = dependency.organizationMemberModel
        this.eventModel = dependency.eventModel
        this.offerModel = dependency.offerModel
        this.eventTemplateModel = dependency.eventTemplateModel
        this.eventTemplateDesignModel = dependency.eventTemplateDesignModel
        this.eventDesignModel = dependency.eventDesignModel
        this.nlpAdapter = dependency.nlpAdapter
        this.placeModel = dependency.placeModel
    }

    /**
     * 新增組織
     * @param uid 
     * @param founder 
     * @returns 
     */
    async newItem(uid: string, membership: IOrganizationMember) {
        const organizationName = String(membership.organizationName)
        const keywords = this.nlpAdapter.cutForSearch(organizationName)
        const defaultOrganization: IOrganization = {
            sameAs: [], // 必要
            name: organizationName,
            email: membership.email,
            keywords,
        }
        const newOrganization = await this.organizationModel.createOrganization(uid, defaultOrganization) as IOrganization
        membership.organizationId = newOrganization.id
        await this.organizationMemberModel.addMember(uid, membership)
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

        const organizationName = String(organization.name)
        const keywords = this.nlpAdapter.cutForSearch(organizationName)
        organization.keywords = keywords
        const count = await this.organizationModel.mergeOrganizationById(uid, organization.id, organization)

        // Organization Member
        this.organizationMemberModel.setMembersByOrgnaizationId(uid, {
            organizationName: organization.name,
            organizationLogo: organization.logo, // 前面已更新過
            organizationId: organization.id,
        })
        // Event Template 
        this.eventTemplateModel.mergeTemplateByOrganizerId(uid, organization.id, {
            organizerName: organization.name,
            organizerLogo: organization.logo, // 前面已更新過
        })
        // Offer 
        this.offerModel.updateOfferGroupByOffererId(uid, organization.id, {
            offererName: organization.name,
        })
        this.offerModel.updateOfferGroupBySellerId(uid, organization.id, {
            sellerName: organization.name,
        })
        // Design
        this.eventTemplateDesignModel.setByOrganizationId(uid, organization.id, {
            organizationName: organization.name,
        })
        this.eventDesignModel.setByOrganizationId(uid, organization.id, {
            organizationName: organization.name,
        })
        // Place
        this.placeModel.mergeByOrganizationId(uid, organization.id, {
            organizationName: organization.name,
            organizationLogo: organization.logo, // 前面已更新過
        })
        return count
    }

    /**
     * 取得列表
     * @returns 
     */
    async getOrganizationList(query: IOrganizationQuery,) {
        if (query.name) {
            query.keywords = this.nlpAdapter.cutForSearch(query.name)
        }
        const list: IOrganization[] = await this.organizationModel.getOrganizationList(query)
        return list
    }

    // /**
    //  * 取得列表
    //  * @returns 
    //  */
    // async getOrganizationList(uid: string,) {
    //     const list: IOrganization[] = await this.organizationModel.getOrganizationList(uid)
    //     return list
    // }

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