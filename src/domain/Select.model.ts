import type { IOptionsItem, } from '../entities/meta'
import { Query, QuerySnapshot, DocumentReference, DocumentData, } from 'firebase-admin/firestore'
import type { IModelPorts } from '../ports/out.model'
import VekozModel from '../adapters/VekozModel.out'
import { ICrudOptions } from '../ports/out.crud'
import { ISelectDocData } from '../entities/meta'

export default class SelectModel extends VekozModel {
    constructor(data: IModelPorts) {
        super(data)
        // this.uploadTaiwans()
    }

    async uploadTaiwans() {
        await super.createItem('', taiwanregions)
    }

    async getOptionsByKey(key: string): Promise<IOptionsItem[] | undefined> {
        const optoins: ICrudOptions = {
            count: {
                absolute: 1
            }
        }
        const selectDocData = await super.getItemsByQuery([['key', '==', key]], optoins) as ISelectDocData[]
        if (selectDocData[0]) {
            return selectDocData[0].options
        }
    }
}

const taiwanregions = {
    "key": "taiwan",
    "options": [
        {
            "label": "台北市",
            "value": "TPE"
        },
        {
            "label": "新北市",
            "value": "NWT"
        },
        {
            "label": "桃園市",
            "value": "TAO"
        },
        {
            "label": "台中市",
            "value": "TXG"
        },
        {
            "label": "台南市",
            "value": "TNN"
        },
        {
            "label": "高雄市",
            "value": "KHH"
        },
        {
            "label": "基隆市",
            "value": "KEE"
        },
        {
            "label": "新竹市",
            "value": "HSC"
        },
        {
            "label": "新竹縣",
            "value": "HSQ"
        },
        {
            "label": "苗栗縣",
            "value": "MIA"
        },
        {
            "label": "彰化縣",
            "value": "CHA"
        },
        {
            "label": "南投縣",
            "value": "NAN"
        },
        {
            "label": "嘉義市",
            "value": "CYI"
        },
        {
            "label": "嘉義縣",
            "value": "CYQ"
        },
        {
            "label": "雲林縣",
            "value": "YUN"
        },
        {
            "label": "屏東縣",
            "value": "PIF"
        },
        {
            "label": "宜蘭縣",
            "value": "ILA"
        },
        {
            "label": "花蓮縣",
            "value": "HUA"
        },
        {
            "label": "台東縣",
            "value": "TTT"
        },
        {
            "label": "澎湖縣",
            "value": "PEN"
        },
        {
            "label": "連江縣",
            "value": "LIE"
        },
        {
            "label": "金門縣",
            "value": "KIN"
        }
    ]
}