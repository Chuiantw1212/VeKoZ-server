import admin from "firebase-admin"
import { getAuth, Auth, DecodedIdToken } from 'firebase-admin/auth'
import { Firestore, getFirestore, } from 'firebase-admin/firestore'
import { getStorage, Storage } from 'firebase-admin/storage'
export class FirebaseAdapter {
    private firestore: Firestore = null as any
    private auth: Auth = null as any
    private publicBucket: ReturnType<Storage['bucket']> = null as any
    async initializeSync(apiKey: string) {
        const credential = admin.credential.cert(apiKey)
        admin.initializeApp({
            credential
        })
        /**
         * 使用public storage
         * https://firebase.google.com/docs/storage/admin/start
        */
        const firebaseStorage: Storage = getStorage()
        const publicBucket = firebaseStorage.bucket('public.dev.vekoz.org')
        this.publicBucket = publicBucket
        /**
         * 管理Firebase使用者
         * https://firebase.google.com/docs/auth/admin/manage-users
        */
        this.auth = getAuth()
        /**
         * 使用Firestore(collection)
         * https://firebase.google.com/docs/firestore/quickstart
         */
        const firestore = getFirestore();
        firestore.settings({ ignoreUndefinedProperties: true, });
        this.firestore = firestore
    }
    getPublicBucket() {
        return this.publicBucket
    }
    getFirestore() {
        return this.firestore
    }
    getCollection(collectionName: string) {
        return this.firestore.collection(collectionName)
    }
    async verifyIdToken(idToken: string | null): Promise<DecodedIdToken> {
        if (!idToken) {
            throw '找不到身份識別(ID Token)，請重新登入或向開發人員抱怨Q_Q'
        }
        const replacedToken = idToken.replace('Bearer ', '')
        const decodedToken: DecodedIdToken = await this.auth.verifyIdToken(replacedToken)
        if (!decodedToken) {
            throw '找不到身份(ID)，請重新登入或向開發人員抱怨Q_Q'
        }
        return decodedToken
    }
}
export default new FirebaseAdapter()