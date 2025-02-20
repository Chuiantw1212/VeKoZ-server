import * as OpenCC from 'opencc-js';
const CKIPClient = require('ckip-client')
import { Jieba, TfIdf } from '@node-rs/jieba'
import { idf } from '@node-rs/jieba/dict'
/**
 * cn: 簡體中文（中國大陸）
 * tw: 繁體中文（臺灣）
 * twp: 且轉換詞彙（例如：自行車 -> 腳踏車）
 * hk: 繁體中文（香港）
 */
export default class NlpAdapter {
    private twpCnConverter: OpenCC.ConvertText
    private cnTwpConveter: OpenCC.ConvertText

    constructor() {
        const twpCnConverter = OpenCC.Converter({ from: 'twp', to: 'cn' });
        this.twpCnConverter = twpCnConverter
        const cnTwpConveter = OpenCC.Converter({ from: 'cn', to: 'twp' });
        this.cnTwpConveter = cnTwpConveter
    }
    async fromTaiwanToChina(text: string) {
        return this.twpCnConverter(text)
    }
    async fromChinaToTaiwan(text: string) {
        return this.cnTwpConveter(text)
    }
}