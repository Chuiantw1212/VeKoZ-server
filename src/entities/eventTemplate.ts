import type { IOffer } from "./offer";
/**
 * https://schema.org/Organization
 */

export interface IEventTemplate extends IEventTemplateQuery {
    // [key: string]: any // 加了會喪失typescript功能
    name?: string,
    uid?: string;
    designs?: ITemplateDesign[]
    designIds?: string[],
    type?: string,
    allowMethods?: string[],
    organizerLogo?: string,
    organizerName?: string,
}

export interface IEventTemplateQuery {
    id?: string; // doc id
    organizerId?: string,
}

export interface ITemplateDesign extends ITemplateDesignMutable {
    id?: string,
    eventId?: string,
    type?: string,
    templateId?: string,
    formField?: string, // 讓連動更新欄位
    required?: boolean,
}

/**
 * 與前端共用Interface，盡可能區分定義，避免都使用value便於未來維護
 */
export interface ITemplateDesignMutable {
    label?: string,
    // 未定義欄位使用
    value?: any,
    // Organization
    organizationName?: string,
    organizationId?: string,
    // Organization members
    memberIds?: string[],
    memberNames?: string[],
    // 時間
    startDate?: Date,
    endDate?: Date,
    // 線下地點
    placeId?: string, // entities, 如果有owner可共用評價
    placeOwnerId?: string,
    placeName?: string,
    placeAddress?: string,
    placeAddressRegion?: string, // 第一級行政區
    // 線上地點
    urlName?: string,
    urlValue?: string,
    // 票券
    categoryId?: string,
    offers?: IOffer[]
}

export interface IPostTemplateDesignReq {
    type: string,
    destination: string,
    templateId: string,
    required: boolean,
    // templateDesignIds: string[]
}

export interface IDeleteTemplateDesignReq {
    id: string,
    templateId: string,
    templateDesignIds: string[]
}

export interface IPatchTemplateDesignReq {
    id: string,
    type: string,
    // 需要連動的Id
    placeId?: string,
    organizatoinId?: string,
    value: any,
}