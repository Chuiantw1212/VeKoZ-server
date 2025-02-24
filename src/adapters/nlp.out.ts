import * as OpenCC from 'opencc-js'
import { Jieba, Keyword, TfIdf } from '@node-rs/jieba'
import { idf, dict } from '@node-rs/jieba/dict'
/**
 * cn: 簡體中文（中國大陸）
 * tw: 繁體中文（臺灣）
 * twp: 且轉換詞彙（例如：自行車 -> 腳踏車）
 * hk: 繁體中文（香港）
 * https://github.com/nk2028/opencc-js/blob/HEAD/README-zh-TW.md
 */
/**
 * 關鍵字擷取與斷詞
 * https://www.npmjs.com/package/@node-rs/jieba
 */
export default class NlpAdapter {
    private twpCnConverter: OpenCC.ConvertText
    private cnTwpConveter: OpenCC.ConvertText
    private jieba: Jieba
    private tfIdf: TfIdf

    constructor() {
        const twpCnConverter = OpenCC.Converter({ from: 'twp', to: 'cn' });
        this.twpCnConverter = twpCnConverter

        const cnTwpConveter = OpenCC.Converter({ from: 'cn', to: 'twp' });
        this.cnTwpConveter = cnTwpConveter

        this.jieba = Jieba.withDict(dict)
        this.tfIdf = TfIdf.withDict(idf)
    }
    private fromTaiwanToChina(text: string) {
        return this.twpCnConverter(text)
    }
    private fromChinaToTaiwan(text: string) {
        return this.cnTwpConveter(text)
    }

    /**
     * 單純斷詞
     * @param text 
     * @returns 
     */
    cut(text: string,) {
        const cnText = this.fromTaiwanToChina(text)
        const cnWords: string[] = this.jieba.cut(cnText)
        const twTexts = cnWords.map(cnWord => {
            const twWord = this.fromChinaToTaiwan(cnWord)
            return twWord
        })
        return twTexts
    }

    /**
     * 長文萃取關鍵字
     * @param text 
     * @returns 
     */
    extractKeywords(text: string,): string[] {
        const cnText = this.fromTaiwanToChina(text)
        /**
         * https://firebase.google.com/docs/firestore/query-data/queries#limits_on_or_queries
         */
        const keywords: Keyword[] = this.tfIdf.extractKeywords(
            this.jieba,
            cnText,
            30,
        )
        const result = keywords.map(keyword => {
            const twText = this.fromChinaToTaiwan(keyword.keyword)
            return twText
        })
        return result
    }

    /**
     * 將有意義的名字便於搜尋使用
     * @param text 
     * @returns 
     */
    cutForSearch(text: string) {
        const cnText = this.fromTaiwanToChina(text)
        const cnWords: string[] = this.jieba.cutForSearch(cnText)
        const meaningfulWords = cnWords.filter(word => {
            return word.trim()
        })
        const twTexts = meaningfulWords.map(cnWord => {
            const twWord = this.fromChinaToTaiwan(cnWord)
            return twWord
        })
        return twTexts
    }
}