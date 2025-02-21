import GoogleCloudPlugin from "../../adapters/googleSecretManager.out"
import { GoogleCalendarPlugin } from "../../adapters/googleCalendar.out"
import { calendar_v3, google } from "googleapis"
import { IEvent } from "../../entities/event"

interface IGooglePlugins {
    calendar: GoogleCalendarPlugin
}

export default class VerifyIdTokenService {
    protected calendar: GoogleCalendarPlugin
    constructor(plugins: IGooglePlugins) {
        this.calendar = plugins.calendar
    }
    async createGoogleEvent(event: IEvent) {
        const googleEvent: calendar_v3.Params$Resource$Events$Insert = {

        }
        const result = await this.calendar.createCalendarEvent(googleEvent)
    }

    async getGoogleCalendarEventList(uid: string, params: calendar_v3.Params$Resource$Events$List): Promise<IEvent[] | undefined> {
        if (!params.calendarId) {
            throw 'calendarId未提供'
        }
        const googleEventList = await this.calendar.getCalendarEventList(params)
        if (googleEventList) {
            const googleEventWithDates = googleEventList.filter(googleEvent => {
                return googleEvent.start && googleEvent.end
            })
            const eventList = googleEventWithDates.map((googleEvent) => {
                const event: IEvent = {
                    uid,
                    id: googleEvent.id ?? '',
                    name: googleEvent.summary ?? '未命名',
                    description: googleEvent.description ?? '',
                    startDate: googleEvent.start?.dateTime ?? '',
                    endDate: googleEvent.end?.dateTime ?? '',
                    locationAddress: googleEvent.location ?? '',
                    // hasVirtualLocation: googleEvent.htmlLink ?? '',
                    // lastmod: googleEvent.updated,
                }
                return event
            })
            return eventList
        }
    }
}