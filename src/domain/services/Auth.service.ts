import FirebasePlugin from "../../adapters/firebase.out.js"
export default class VerifyIdTokenService {
    protected adapter: typeof FirebasePlugin = null as any
    constructor(firebase: typeof FirebasePlugin) {
        this.adapter = firebase
    }
    async verifyIdToken(idToken: string) {
        const decodedIdToken = await this.adapter.verifyIdToken(idToken)
        return decodedIdToken
    }

    // reset password

    // change password
}