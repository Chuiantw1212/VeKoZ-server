export interface IUser {
    ui: { // 暫存前端的畫面偏好
        event: {
            calendar: string,
        },
        eventTemplate: {
            name: string,
        },
    }
}