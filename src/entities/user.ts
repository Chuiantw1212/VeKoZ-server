/**
 * 來自Firebase的用戶資料。
 * 是否公開。
 * 這邊屬於私密資料，一定要跟別的資料區分開來。
 */
export interface IUser {
    [key: string]: any,
    id?: string,
    uid?: string,
    displayName?: string,
    email?: string,
    photoURL?: string,
    phoneNumber?: string,
    providerId?: string,
    preference?: IUserPreference,
    // seo使用
    seoName?: string,
}

/**
 * 1. 直接用頁面架構去處理偏好，
 *    比較好維護。
 * 2. 未來延伸功能如果要用別的信箱管理，只要把uid抽掉就好，其他都可以照舊。
 */
export interface IUserPreference {
    uid?: string,
    id: string, // 這邊使用IUser主檔的Id，就不自己建立
    // publicInfos: 'uid' | 'displayName' | 'email' | 'photoURL' | 'phoneNumber'[]
    userType: 'host' | 'attendee',
    event: {
        calendarViewType: 'dayGridMonth' | 'dayGridWeek' | 'listWeek'
        organizationIds: string[]
    },
} 