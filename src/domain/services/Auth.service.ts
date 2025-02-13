import FirebaseAdapter from "../../adapters/firebase.out.js"
export default class VerifyIdTokenService {
    protected adapter: typeof FirebaseAdapter = null as any
    constructor(firebase: typeof FirebaseAdapter) {
        this.adapter = firebase
    }
    async verifyIdToken(idToken: string) {
        const decodedIdToken = await this.adapter.verifyIdToken(idToken)
        return decodedIdToken
    }
}