/**
 * 來自Firebase的用戶資料，參考Schema.org整合
 * https://schema.org/Person
 */
export interface IUser {
    [key: string]: any,
    id?: string,
    uid?: string,
    name?: string,
    email?: string,
    avatar?: string,
    telephone?: string,
    providerId?: string,
    preference?: IUserPreference,
    // 講師個人頁
    seoName?: string,
    designIds?: string[],
    designs?: IUserDesign[]
}

export interface IUserDesign {
    [key: string]: any,
    id?: string,
    formField?: string,
    // 尚未歸類
    value?: any
}

/**
 * 1. 直接用頁面架構去處理偏好，
 *    比較好維護。
 * 2. 未來延伸功能如果要用別的信箱管理，只要把uid抽掉就好，其他都可以照舊。
*/
export interface IUserPreference {
    uid?: string,
    id?: string, // 這邊使用IUser主檔的Id，就不自己建立
    menuType?: 'host' | 'attendee',
    event?: {
        calendarViewType: 'dayGridMonth' | 'dayGridWeek' | 'listWeek'
        organizationIds: string[]
    },
} 