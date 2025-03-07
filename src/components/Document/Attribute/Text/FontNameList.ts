/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Context } from "@/context";

export const fontNameListZh = [
    'PingFang SC', 'Adobe 仿宋 Std', 'Adobe 宋体 Std', 'Adobe 楷体 Std', 'Adobe 黑体 Std', 'Hei',
    'Kai', 'Microsoft JhengHei', 'Microsoft JhengHei UI', 'Microsoft YaHei UI', '宋体',
    'MingLiU', 'MingLiU_HKSCS', 'PMingLiU', 'STFangsong', 'STHeiti', 'STKaiti', '黑体-简',
    'STSong', '仿宋', '冬青黑体简体中文', '凌慧体-简', '华文中宋', '华文仿宋', '华文新魏',
    '华文楷体', '华文琥珀', '华文行楷', '华文隶书', '娃娃体-简', '圆体-简', '等线',
    '宋体-简', '微软雅黑', '手札体-简', '报隶-简', '新宋体', '楷体',
    '楷体-简', '翩翩体-简', '苹方-简', '行楷-简', '隶变-简', '雅痞-简', '魏碑-简', '黑体',
    'Apple LiGothic', 'Apple LiSung', 'BiauKai', 'Hiragino Sans CNS', 'LiHei Pro', 'LiSong Pro',
    '兰亭黑-繁', '凌慧体-繁', '圆体-繁', '娃娃体-繁', '宋体-繁', '手札体-繁', '报隶-繁',
    '楷体-繁', '翩翩体-繁', '苹方-港', '苹方-繁', '行楷-繁', '隶变-繁', '雅痞-繁', '魏碑-繁', '黑体-繁',
    "思源等宽", "思源黑体 CN", "香蕉大将军灵感体", "小豆岛山中月简-闪 常规", "汉仪凌波体简"
]

export const fontNameListEn = [
    'Arial', 'Helvetica', 'Helvetica Neue', 'Garamond',
    'Adobe Garamond Pro', 'Adobe Caslon Pro', 'Baskerville', 'Times',
    'Times New Roman', 'Calibri', 'Comic Sans MS',
    'Georgia', 'MS PMincho', 'Tahoma', 'Courier', 'Courier New', 'Verdana',
    "Academy Engraved LET Fonts", "Al Nile", "Al Tarikh", "AlBayan", "Andale Mono", "AppleMyungjo", "AppleSDGothicNeo", "AquaKana", "Arial Narrow", "Arial Rounded",
    "Arial Unicode", "ArialHB", "Athelas", "Avenir Next Conden,sed", "Avenir Next", "Avenir", "Ayuthaya", "Baghdad", "Bangla MN", "Bangla Sangam MN", "Beirut", "BigCaslon", "Bodoni 72 OS", "Bodoni 72 Smallcaps Book", "Bodoni 72", "Bodoni Ornaments", "Bradley Hand", "Brush Script", "Chalkboard", "ChalkboardSE", "Chalkduster",
    "Charter", "Cochin", "Copperplate", "Corsiva", 'Damascus', 'DecoTypeNaskh', 'Devanagari Sangam MN', 'DevanagariMT', 'Didot', 'DIN Alternate', 'DIN Condensed', 'Diwan Kufi', 'Diwan Thuluth', 'EuphemiaCAS', 'Farah', 'Farisi', 'Futura', 'FZJiaGW-2', 'Galvji', 'GeezaPro', 'Geneva', 'GillSans', 'Gujarati Sangam MN', 'GujaratiMT', 'Gurmukhi MN', 'Gurmukhi Sangam MN', 'Gurmukhi', 'HelveLTMM', 'HelveticaNeue', 'Herculanum',
    'Hiragino Sans GB', 'Hoefler Text Ornaments', 'Hoefler Text', 'Impact', 'InaiMathi-MN', 'Iowan Old Style', 'ITFDevanagari', 'Kailasa', 'Kannada MN', 'Kannada Sangam MN', 'Kefa', 'Keyboard', 'Khmer MN', 'Khmer Sangam MN', 'Kohinoor', 'KohinoorBangla', 'KohinoorGujarati', 'KohinoorTelugu', 'Kokonor', 'Krungthep', 'KufiStandardGK', 'Lao MN', 'Lao Sangam MN', 'LastResort', 'LucidaGrande', 'Luminari', 'Malayalam MN', 'Malayalam Sangam MN', 'Marion', 'MarkerFelt', 'Menlo', 'Microsoft Sans Serif', 'Mishafi Gold', 'Mishafi', 'Monaco', 'Mshtakan', 'MuktaMahee',
    'Muna', 'Myanmar MN', 'Myanmar Sangam MN', 'Nadeem', 'NewPeninimMT', 'NewYork', 'NewYorkItalic', 'NISC18030', 'Noteworthy', 'Noto Nastaliq', 'Noto Sans Adlam', 'Noto Sans Armenian', 'Noto Sans Avestan', 'Noto Sans Bamum', 'Noto Sans BassaVah', 'Noto Sans Batak', 'Noto Sans Bhaiksuki', 'Noto Sans Brahmi', 'Noto Sans Buginese', 'Noto Sans Buhid', 'Noto Sans Carian', 'Noto Sans CaucasianAlbanian',
    'Noto Sans Chakma', 'Noto Sans Cham', 'Noto Sans Coptic', 'Noto Sans Cuneiform', 'Noto Sans Cypriot', 'Noto Sans Duployan', 'Noto Sans EgyptianHieroglyphs', 'Noto Sans Elbasan', 'Noto Sans Glagolitic', 'Noto Sans Gothic', 'Noto Sans GunjalaGondi', 'Noto Sans HanifiRohingya', 'Noto Sans Hanunoo', 'Noto Sans Hatran',
    'Noto Sans ImperialAramaic', 'Noto Sans InscriptionalPahlavi', 'Noto Sans InscriptionalParthian', 'Noto Sans Javanese', 'Noto Sans Kaithi', 'Noto Sans Kannada', 'Noto Sans KayahLi', 'Noto Sans Kharoshthi', 'Noto Sans Khojki', 'Noto Sans Khudawadi',
    'Noto Sans Lepcha', 'Noto Sans Limbu', 'Noto Sans LinearA', 'Noto Sans LinearB', 'Noto Sans Lisu', 'Noto Sans Lycian', 'Noto Sans Lydian', 'Noto Sans Mahajani', 'Noto Sans Mandaic', 'Noto Sans Manichaean', 'Noto Sans Marchen', 'Noto Sans MasaramGondi', 'Noto Sans MeeteiMayek', 'Noto Sans MendeKikakui', 'Noto Sans Meroitic',
    'Noto Sans Miao', 'Noto Sans Modi', 'Noto Sans Mongolian', 'Noto Sans Mro', 'Noto Sans Multani', 'Noto Sans Myanmar', 'Noto Sans Nabataean', 'Noto Sans Newa', 'Noto Sans NewTaiLue', 'Noto Sans NKo', 'Noto Sans OlChiki', 'Noto Sans OldHungarian', 'Noto Sans OldItalic', 'Noto Sans OldNorthArabian',
    'Noto Sans OldPermic', 'Noto Sans OldPersian', 'Noto Sans OldSouthArabian', 'Noto Sans OldTurkic', 'Noto Sans Oriya', 'Noto Sans Osage', 'Noto Sans Osmanya', 'Noto Sans PahawhHmong', 'Noto Sans Palmyrene', 'Noto Sans PauCinHau', 'Noto Sans PhagsPa', 'Noto Sans Phoenician', 'Noto Sans PsalterPahlavi', 'Noto Sans Rejang', 'Noto Sans Samaritan',
    'Noto Sans Saurashtra', 'Noto Sans Sharada', 'Noto Sans Siddham', 'Noto Sans SoraSompeng', 'Noto Sans Sundanese', 'Noto Sans SylotiNagri', 'Noto Sans Syriac', 'Noto Sans Tagalog', 'Noto Sans Tagbanwa', 'Noto Sans TaiLe', 'Noto Sans TaiTham', 'Noto Sans TaiViet', 'Noto Sans Takri', 'Noto Sans Thaana',
    'Noto Sans Tifinagh', 'Noto Sans Tirhuta', 'Noto Sans Ugaritic', 'Noto Sans Vai', 'Noto Sans Wancho', 'Noto Sans WarangCiti', 'Noto Sans Yi', 'Noto SerifAhom', 'Noto SerifBalinese', 'Noto SerifMyanmar', 'Noto SerifYezidi', 'Optima', 'Oriya MN', 'Oriya Sangam MN', 'Palatino', 'Papyrus', 'PartyLET-plain', 'Phosphate', 'PingFang', 'PlantagenetCherokee', 'PTMono', 'PTSans', 'PTSerif', 'PTSerifCaption', 'Raanana', 'Rockwell', 'Sana', 'Sathu',
    'Savoye LET', 'Seravek', 'SF Arabic Ultralight', 'SF Compact Ultralight', 'SF Compact Rounded Ultralight', 'SF NS Mono', 'SFNSRounded', 'Shree714', 'SignPainter', 'Silom', 'Sinhala MN', 'Sinhala Sangam MN', 'Skia', 'SnellRoundhand', 'Songti', 'Source Han Mono',
    'Source Han Sans CN', 'STIXGeneral', 'SukhumvitSet', 'SuperClarendon', 'Symbol', 'Tamil MN', 'Tamil Sangam MN', 'Telugu MN', 'Telugu Sangam MN', 'Thonburi', 'Trattatello', 'Trebuchet MS', 'Webdings', 'Wingdings 2', 'Wingdings 3', 'Wingdings', 'ZapfDingbats',
    'ヒラギノ明朝 ProN', "Hiragino Maru Gothic Pro W4"
]

export const isSupportFontFamily = function (font: string) {
    if (typeof font != "string") {
        return [];
    }
    //基础字体
    const h = "Arial";

    const text = "abcdefgSTUVWXYZ12345!@#$%^&*(中文字体";
    const d = 100;
    const a = 100, i = 100;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return [];
    canvas.width = a;
    canvas.height = i;
    context.textAlign = "center";
    context.fillStyle = "black";
    context.textBaseline = "middle";
    const g = function (j: string, w: number | string) {
        context.clearRect(0, 0, a, i);
        //        字体是传入的j,或者是默认的h
        context.font = w + ' ' + d + "px " + j + ", " + h;
        context.fillText(text, a / 2, i / 2);
        //        获取所有的canvas图片信息
        const k = context.getImageData(0, 0, a, i).data;
        return [].slice.call(k).filter(function (l) {
            return l != 0
        });
    };

    let result: any = [];
    if (g(h, 'normal').join("") !== g(font, 'normal').join("")) {
        result = [font];
    }
    return result;
};

export function FontAvailable(fontName: string) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const fontWeight = [
        { key: "Regular", weight: 400, value: 0 },
        { key: "Bold", weight: 700, value: 0 },
        { key: "Black", weight: 900, value: 0 },
        { key: "Medium", weight: 500, value: 0 },
        { key: "SemiBold", weight: 600, value: 0 },
        { key: "ExtraBold", weight: 800, value: 0 },
        { key: "Light", weight: 300, value: 0 },
        { key: "ExtraLight", weight: 200, value: 0 },
        { key: "Thin", weight: 100, value: 0 },
    ]
    if (!context) return;
    const text = 'abcdefghijklmnopqrSTUVWXYZ0123456789!@#$%^&*(中文字体';
    context.font = 'normal 72px monospace';
    const baselineSize = context.measureText(text).width;

    context.font = 'normal 72px ' + fontName + ', monospace';
    const newSize = context.measureText(text).width;
    let result: any = [];
    if (baselineSize !== newSize) {
        for (let i = 0; i < fontWeight.length; i++) {
            const weight = fontWeight[i].weight;
            context.font = `${weight} 72px ${fontName}, monospace`;
            const newSizeWeight = context.measureText(text).width;
            fontWeight[i].value = newSizeWeight;
        }

        const r = fontWeight.reduce((dict, item) => {
            const key = item.value;
            if (!dict[key]) {
                dict[key] = item;
            }
            return dict;
        }, {} as any);
        result = Object.values(r);
    }
    return result;
}


export const fontWeightConvert = (weight: number | undefined, italic: boolean) => {
    switch (weight) {
        case 400:
            if (italic) {
                return 'Italic';
            }
            return 'Regular';
        case 300:
            return 'Light';
        case 700:
            if (italic) {
                return 'Bold Italic';
            }
            return 'Bold';
        case 100:
            return 'Thin';
        case 200:
            return 'ExtraLight';
        case 500:
            return 'Medium';
        case 600:
            return 'SemiBold';
        case 800:
            return 'ExtraBold';
        case 900:
            if (italic) {
                return 'Black Italic';
            }
            return 'Black';
        case undefined:
            if (italic) {
                return 'Italic';
            }
            return 'Regular';
        default:
            return 'Regular';
    }
}

export function fontWeightList(fontName: string, italic: boolean) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });
    const fontWeight = [
        { key: "Regular", weight: 400, value: '', italic: false },
        { key: "Bold", weight: 700, value: '', italic: false },
        { key: "Light", weight: 300, value: '', italic: false },
        { key: "ExtraLight", weight: 200, value: '', italic: false },
        { key: "Black", weight: 900, value: '', italic: false },
        { key: "Thin", weight: 100, value: '', italic: false },
        { key: "Medium", weight: 500, value: '', italic: false },
        { key: "SemiBold", weight: 600, value: '', italic: false },
        { key: "ExtraBold", weight: 800, value: '', italic: false },
    ]
    const fontItalic = [
        { key: "Italic", weight: 400, value: '', italic: true },
        { key: "Bold Italic", weight: 700, value: '', italic: true },
        { key: "Black Italic", weight: 900, value: '', italic: true },
    ]
    if (!context) return;
    const text = 'abcdefgSTUVWXYZ12345!@#$%^&*(中文字体';
    //基础字体
    const d = 100;
    const a = 100, i = 100;
    canvas.width = a;
    canvas.height = i;
    context.textAlign = "center";
    context.fillStyle = "black";
    context.textBaseline = "middle";
    const g = function (j: string, w: number | string) {
        context.clearRect(0, 0, a, i);
        context.font = w + ' ' + d + "px " + j + ", monospace";
        context.fillText(text, a / 2, i / 2);
        const k = context.getImageData(0, 0, a, i).data;
        return [].slice.call(k).filter(function (l) {
            return l != 0
        });
    };
    let result: any = [];
    for (let i = 0; i < fontWeight.length; i++) {
        const weight = fontWeight[i].weight;
        const r = g(fontName, weight).join("");
        fontWeight[i].value = r;
    }
    const r = fontWeight.reduce((dict, item) => {
        const key = item.value;
        if (!dict[key]) {
            dict[key] = item;
        }
        return dict;
    }, {} as any);
    result = Object.values(r);

    result.sort((a: any, b: any) => {
        if (a.weight > b.weight) {
            return 1;
        } else if (a.weight < b.weight) {
            return -1;
        } else {
            return 0;
        }
    })
    if (italic) {
        if (g(fontName, 'normal').join("") !== g(fontName, 'Italic').join("")) {
            for (let i = 0; i < fontItalic.length; i++) {
                const style = fontItalic[i].key;
                const r = g(fontName, style).join("");
                fontItalic[i].value = r;
            }

            const r = fontItalic.reduce((dict, item) => {
                const key = item.value;
                if (!dict[key]) {
                    dict[key] = item;
                }
                return dict;
            }, {} as any);
            result.push(...Object.values(r));
        }
    }
    return result;
}

export const fontweightNameConvert = (weight: string) => {
    switch (weight) {
        case 'Regular':
            return { weight: 400, italic: false };
        case 'Light':
            return { weight: 300, italic: false };
        case 'Bold':
            return { weight: 700, italic: false };
        case 'Thin':
            return { weight: 100, italic: false };
        case 'ExtraLight':
            return { weight: 200, italic: false };
        case 'Medium':
            return { weight: 500, italic: false };
        case 'SemiBold':
            return { weight: 600, italic: false };
        case 'ExtraBold':
            return { weight: 800, italic: false };
        case 'Black':
            return { weight: 900, italic: false };
        case 'Italic':
            return { weight: 400, italic: true };
        case 'Bold Italic':
            return { weight: 700, italic: true };
        case 'Black Italic':
            return { weight: 900, italic: true };
        default:
            return { weight: 400, italic: false };
    }
}


export function timeSlicingTask(context: Context, fontList: string[], lang: string) {
    let index = 0;
    function executeBatch() {
        const end = Math.min(index + 10, fontList.length);
        for (let i = index; i < end; i++) {
            try {
                const results: string[] = isSupportFontFamily(fontList[i]);
                if (lang === 'zh' && results.length > 0) {
                    context.workspace.setFontNameListZh(results[0]);
                } else if (lang === 'en' && results.length > 0) {
                    context.workspace.setFontNameListEn(results[0]);
                }
            } catch (error) {
                console.error('Error checking font availability:', error);
            }
        }
        index = end;
        if (index < fontList.length) {
            requestAnimationFrame(executeBatch); // 利用 requestAnimationFrame 分帧执行任务
        }
    }
    executeBatch();
}

export const screenFontList = (context: Context) => {
    const fontList = context.workspace.userLocalFontList;
    if (fontList.length) {
        let index = 0;
        function executeBatch() {
            const end = Math.min(index + 10, fontList.length);
            for (let i = index; i < end; i++) {
                try {
                    const results: string[] = isSupportFontFamily(fontList[i]);
                    if (results.length > 0) {
                        context.workspace.setFontNameListLocal(results[0]);
                    } else {
                        context.workspace.setFontNameListFailureLocal(fontList[i]);
                    }
                } catch (error) {
                    console.error('Error checking font availability:', error);
                }
            }
            index = end;
            if (index < fontList.length) {
                requestAnimationFrame(executeBatch);
            }
        }
        executeBatch();
    }
}
