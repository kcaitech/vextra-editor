export const fontNameListZh = [
    'PingFangSC-Regular', 'Adobe 仿宋 Std', 'Adobe 宋体 Std', 'Adobe 楷体 Std', 'Adobe 黑体 Std', 'Hei',
    'Kai', 'Microsoft JhengHei', 'Microsoft JhengHei Light', 'Microsoft JhengHei UI',
    'Microsoft JhengHei UI Light', 'Microsoft YaHei UI', 'Microsoft YaHei UI Light',
    'MingLiU', 'MingLiU_HKSCS', 'PMingLiU', 'STFangsong', 'STHeiti', 'STKaiti', '黑体-简',
    'STSong', '仿宋', '冬青黑体简体中文', '凌慧体-简', '华文中宋', '华文仿宋', '华文新魏',
    '华文楷体', '华文琥珀', '华文行楷', '华文隶书', '娃娃体-简', '圆体-简', '宋体', '等线',
    '宋体-简', '微软雅黑', '微软雅黑 Light', '手札体-简', '报隶-简', '新宋体', '楷体',
    '楷体-简', '翩翩体-简', '苹方-简', '行楷-简', '隶变-简', '雅痞-简', '魏碑-简', '黑体', '等线 Light',
    'Apple LiGothic', 'Apple LiSung', 'BiauKai', 'Hiragino Sans CNS', 'LiHei Pro', 'LiSong Pro',
    '兰亭黑-繁', '凌慧体-繁', '圆体-繁', '娃娃体-繁', '宋体-繁', '手札体-繁', '报隶-繁',
    '楷体-繁', '翩翩体-繁', '苹方-港', '苹方-繁', '行楷-繁', '隶变-繁', '雅痞-繁', '魏碑-繁', '黑体-繁'
]

export const fontNameListEn = [
    'Arial', 'Arial Black', 'Helvetica', 'Helvetica Neue', 'Garamond',
    'Adobe Garamond Pro', 'Adobe Caslon Pro', 'Baskerville', 'Times',
    'Times New Roman', 'Calibri', 'Calibri Light', 'Comic Sans MS',
    'Georgia', 'MS PMincho', 'Tahoma', 'Courier', 'Courier New', 'Verdana'
]

export function FontAvailable(fontName: string) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const fontWeight = [
        { key: "Normal", weight: 400, value: 0 },
        { key: "Light", weight: 300, value: 0 },
        { key: "Bold", weight: 700, value: 0 },
        { key: "Thin", weight: 100, value: 0 },
        { key: "ExtraLight", weight: 200, value: 0 },
        { key: "Medium", weight: 500, value: 0 },
        { key: "SemiBold", weight: 600, value: 0 },
        { key: "ExtraBold", weight: 800, value: 0 },
        { key: "Heavy", weight: 900, value: 0 }
    ]
    if (!context) return;
    const text = 'abcdefghijklmnopqrstuvwxyz0123456789';
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