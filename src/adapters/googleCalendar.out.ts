/**
 * 如果是本地就要運行gcloud auth application-default login來指派ADC
 * https://cloud.google.com/docs/authentication/provide-credentials-adc
 */
import type { calendar_v3 } from "googleapis"
import { google } from 'googleapis'

const calendar = google.calendar('v3');

export class GoogleCalendarPlugin {
    protected calendar: calendar_v3.Calendar
    constructor() {
        this.calendar = calendar
    }
    async setClient(apiKey: string) {
        this.calendar = google.calendar({
            version: 'v3',
            key: apiKey
        })
    }

    async list() {
        const res = await this.calendar.calendarList.list();
        console.log({
            res
        })
    }
}
export default new GoogleCalendarPlugin()