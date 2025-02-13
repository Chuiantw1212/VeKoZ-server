/**
 * 可以被公開搜尋的用戶資料
 */
export interface IUser {
    uid: '',
    displayName: '',
    email: '',
    photoURL: '',
    phoneNumber: '',
    providerId: '',
}

/**
 * 直接用頁面架構去處理偏好，
 * 比較好維護。
 */
export interface IUserPreference {
    uid: '',
    event: {
        calendarView: string,
        organizationIds: string[]
    },
} 