import GoogleCloudPlugin from "../../adapters/googleCloud.out"
export default class VerifyIdTokenService {
    protected plugin: typeof GoogleCloudPlugin
    constructor(plugin: typeof GoogleCloudPlugin) {
        this.plugin = plugin
    }
    async getGoogleCalendarEventList(calendarId: string): Promise<any[]> {
        const eventList = await this.plugin.getCalendarEventList(calendarId)
        return eventList
    }
}