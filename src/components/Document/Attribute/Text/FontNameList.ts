export const fontNameListZh = [
    'PingFangSC-Regular', 'Adobe 仿宋 Std', 'Adobe 宋体 Std', 'Adobe 楷体 Std', 'Adobe 黑体 Std', 'Hei',
    'Kai', 'Microsoft JhengHei', 'Microsoft JhengHei Light', 'Microsoft JhengHei UI',
    'Microsoft JhengHei UI Light', 'Microsoft YaHei UI', 'Microsoft YaHei UI Light',
    'MingLiU', 'MingLiU_HKSCS', 'PMingLiU', 'STFangsong', 'STHeiti', 'STKaiti', '黑体-简',
    'STSong', '仿宋', '冬青黑体简体中文', '凌慧体-简', '华文中宋', '华文仿宋', '华文新魏',
    '华文楷体', '华文琥珀', '华文行楷', '华文隶书', '娃娃体-简', '圆体-简', '宋体', '等线',
    '宋体-简', '微软雅黑', '微软雅黑 Light', '手札体-简', '报隶-简', '新宋体', '楷体',
    '楷体-简', '翩翩体-简', '苹方-简', '行楷-简', '隶变-简', '雅痞-简', '魏碑-简', '黑体', '等线 Light',
    'Apple LiGothic','Apple LiSung','BiauKai','Hiragino Sans CNS','LiHei Pro','LiSong Pro',
    '兰亭黑-繁','凌慧体-繁','圆体-繁','娃娃体-繁','宋体-繁','手札体-繁','报隶-繁',
    '楷体-繁','翩翩体-繁','苹方-港','苹方-繁','行楷-繁','隶变-繁','雅痞-繁','魏碑-繁','黑体-繁'
]

export const fontNameListEn = [
    'Arial','Arial Black','Helvetica','Helvetica Neue','Garamond',
    'Adobe Garamond Pro','Adobe Caslon Pro','Baskerville','Times',
    'Times New Roman','Calibri','Calibri Light','Comic Sans MS',
    'Georgia','MS PMincho','Tahoma','Courier','Courier New','Verdana'
]

export function FontAvailable(fontName: string) {
    return document.fonts.ready.then(function() {
      return document.fonts.check(`12px "${fontName}"`);
    });
}