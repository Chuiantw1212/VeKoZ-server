/**
 * https://schema.org/Organization
 */
export interface IOrganization {
    uid?: string;
    id?: string; // doc id
    banner?: string;
    logo?: string;
    name?: string;
    seoName?: string,
    description?: string,
    sameAs?: string[],
    email?: string, // 聯絡用email
    image?: string,
    googleCalendarId?: string,
}

export interface IOrganizationMember {
    uid?: string, // 權限uid
    id?: string,
    name?: string,
    organizationId?: string,
    organizationName?: string,
    allowMethods?: string[],
    email?: string,
    isFounder?: boolean, // 創辦者資料的刪除修改方式不同
}

/**
 * Event Editor 簡單的事件管理
 * Event Owner 所有人的事件管理、樣板設定
 * Organization Editor 
 * Organization Owner 權限以及各種編輯
 * Owner 所有權限
 */
export interface IOrganizationRole {
    [key: string]: any
    organizationId: string,
}