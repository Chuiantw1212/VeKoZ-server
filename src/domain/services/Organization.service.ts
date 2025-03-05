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
    private eventModel: EventModel
    private offerModel: OfferModel
    private eventTemplateDesignModel: EventTemplateDesignModel
    private eventDesignModel: EventDesignModel

    constructor(dependency: Idependency) {
        this.organizationModel = dependency.organizationModel
        this.organizationMemberModel = dependency.organizationMemberModel
        this.eventModel = dependency.eventModel
        this.offerModel = dependency.offerModel
        this.eventTemplateDesignModel = dependency.eventTemplateDesignModel
        this.eventDesignModel = dependency.eventDesignModel
    }

    /**
     * 新增組織
     * @param uid UserUid
     * @param organization 
     */
    async newItem(uid: string, organization: IOrganization) {
        const logo = organization.logo // 暫存logo
        organization.logo = ''
        const defaultOrganization: IOrganization = Object.assign({
            sameAs: [], // 必要
        }, organization)
        const newOrganization: IOrganization = await this.organizationModel.createOrganization(uid, defaultOrganization)
        newOrganization.logo = logo
        this.updateOrganization(uid, newOrganization)
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
        const tempLogo = organization.image // 共用了套版的名稱
        const tempBanner = organization.banner
        delete organization.image
        delete organization.banner

        const count = await this.organizationModel.mergeOrganizationById(uid, String(organization.id), organization)
        if (count) {
            // 有count表示有權限，不然就是bug了
            if (tempLogo && typeof tempLogo !== 'string') {
                const publicUrl: string = await this.organizationModel.storeLogo(String(organization.id), tempLogo)
                organization.logo = publicUrl
                // 更新Event Organizer Logo
                const eventListL: IEvent[] = await this.eventModel.queryEventList({
                    organizerId: String(organization.id),
                })
                eventListL.forEach((event: IEvent) => {
                    this.eventModel.mergeEventById(uid, String(event.id), {
                        organizerLogo: publicUrl,
                    })
                })
            }
            if (tempBanner && typeof tempBanner !== 'string') {
                const publicUrl: string = await this.organizationModel.storeBanner(String(organization.id), tempBanner)
                organization.banner = publicUrl
            }
        }
        // 另外儲存banner與logo連結
        await this.organizationModel.mergeOrganizationById(uid, String(organization.id), organization)

        this.offerModel.updateOfferGroupByOffererId(uid, String(organization.id), {
            offererName: organization.name,
        })
        this.offerModel.updateOfferGroupBySellerId(uid, String(organization.id), {
            sellerName: organization.name,
        })
        this.eventTemplateDesignModel.setByOrganizationId(uid, String(organization.id), {
            organizationName: organization.name,
        })
        this.eventDesignModel.setByOrganizationId(uid, String(organization.id), {
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

    // /**
    //  * 取得成員列表
    //  * @param uid 使用者uid
    //  * @param organizationId 企業文件Id
    //  * @returns 
    //  */
    // async getMemberList(uid: string, organizationId: string): Promise<IOrganizationMember[]> {
    //     const list: IOrganizationMember[] = await this.organizationMemberModel.getMemberList(uid, organizationId) as IOrganizationMember[]
    //     return list
    // }

    /**
     * 刪除組織
     * @param id 
     * @returns 
     */
    async deleteItem(uid: string, id: string) {
        return await this.organizationModel.deleteItem(uid, id)
    }
}