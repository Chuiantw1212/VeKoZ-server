import { Query, QuerySnapshot, CollectionReference, DocumentReference, DocumentData, Firestore } from 'firebase-admin/firestore'
import Firebase from '../adapters/firebase.out'

interface ILogo {
    type: string;
    buffer: Buffer,
}

export default class Organization {
    collection: CollectionReference = null as any
    publicPucket: any = null

    constructor(firebase: typeof Firebase) {
        this.publicPucket = firebase.bucketPublic
        this.collection = firebase.firestore.collection('organizations')
    }

    /**
     * 儲存組織Logo
     * @param id 公開的DocId
     * @param logo 
     * @returns 
     */
    async storeLogo(id: string, logo: ILogo) {
        if (logo && typeof logo === 'string') {
            throw "typeof logo === 'string'"
        }
        const { type, buffer } = logo
        await this.publicPucket.deleteFiles({
            prefix: `organization/${id}/logo`,
        })
        const uuid = crypto.randomUUID()
        const blob = this.publicPucket.file(`organization/${id}/logo/${uuid}.${type}`)
        const blobStream = blob.createWriteStream({
            resumable: false,
        })
        const typedResult = Buffer.from(buffer)
        // // Format Image
        // const resizedBufferData = await sharp(typedResult).resize(80, 80).toBuffer();
        // save buffer
        blobStream.end(typedResult)
        const publicUrl = blob.publicUrl()
        return publicUrl
    }
}