/**
 * 如果是本地就要運行gcloud auth application-default login來指派ADC
 * https://cloud.google.com/docs/authentication/provide-credentials-adc
 */
import type { calendar_v3 } from "googleapis"
import { google } from 'googleapis'

const calendar = google.calendar('v3');

export class GoogleCalendarPlugin {
    private calendar: calendar_v3.Calendar
    constructor() {
        this.calendar = calendar
    }
    async setClient(apiKey: string) {
        if (!apiKey) {
            throw 'apiKey沒有提供'
        }
        this.calendar = google.calendar({
            version: 'v3',
            auth: apiKey
        })
    }

    async getCalendarEventList(params: calendar_v3.Params$Resource$Events$List) {
        const response = await this.calendar.events.list(params)
        return response.data.items
    }

    async createCalendarEvent(params: calendar_v3.Params$Resource$Events$Insert) {
        const response = await this.calendar.events.insert(params)
        return response.data
    }
}
export default new GoogleCalendarPlugin()