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
    extractKeywords(text: string,): string[] {
        const cnText = this.fromTaiwanToChina(text)
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
    cutForSearch(text: string) {
        const cnText = this.fromTaiwanToChina(text)
        const cnWords: string[] = this.jieba.cutForSearch(cnText)
        const twTexts = cnWords.map(cnWord => {
            const twWord = this.fromChinaToTaiwan(cnWord)
            return twWord
        })
        return twTexts
    }
}