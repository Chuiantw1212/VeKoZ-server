/**
 * https://schema.org/Organization
 */
export interface IOrganization {
    [key: string]: any
    name: string;
    uid: string;
    id: string; // doc id
    logo: string;
    founder: string; // 擁有者
    googleCalendarId: string,
}

export interface IOrganizationMember {
    [key: string]: any
    organizationUid: string,
    userUid: string,
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
    organizationUid: string,
}