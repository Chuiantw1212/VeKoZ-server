/**
 * 來自Firebase的用戶資料。
 * 是否公開。
 * 這邊屬於私密資料，一定要跟別的資料區分開來。
 */
export interface IUser {
    uid: string,
    displayName: string,
    email: string,
    photoURL: string,
    phoneNumber: string,
    providerId: string,
}

/**
 * 1. 直接用頁面架構去處理偏好，
 *    比較好維護。
 * 2. 未來延伸功能如果要用別的信箱管理，只要把uid抽掉就好，其他都可以照舊。
 */
export interface IUserPreference {
    uid: '',
    publicInfos: 'uid' | 'displayName' | 'email' | 'photoURL' | 'phoneNumber'[]
    userType: 'host' | 'attendee',
    event: {
        calendarView: string,
        organizationIds: string[]
    },
} 