import type { IOffer } from "./offer";
/**
 * https://schema.org/Organization
 */

export interface IEventTemplate {
    [key: string]: any
    uid?: string;
    id?: string; // doc id
    designs?: ITemplateDesign[]
    designIds?: string[],
    mutable?: {
        type: string,
    },
    type?: string,
}

export interface ITemplateDesign {
    id?: string,
    eventId?: string,
    type: string,
    mutable?: ITemplateDesignMutable,
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
    mutable: any,
    type: string,
    // 需要連動的Id
    placeId?: string,
    organizatoinId?: string,
}