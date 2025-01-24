/**
 * LimitedEventManager 簡單的事件管理
 * FullEventManager 所有人的事件管理、樣板設定
 * FullAccess, 所有權限
 */

export interface IOrganizationRole {
    [key: string]: any
    organizationUid: string,
    // userUid: string,
}