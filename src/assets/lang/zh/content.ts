import { ShapeType } from "@kcdesign/data";
export const shape: any = {
    group: "编组",
    page: "页面",
    line: '直线',
    oval: '圆形',
    artboard: '容器',
    arrow: '箭头',
    text: '文字',
    image: '图片',
    input_text: '输入文本',
    table: '表格',
    contact: '连接线',
    symbol: '组件',
    curve: "曲线工具",
    clip: "裁剪工具",
    default: '默认',
}
shape[ShapeType.Rectangle] = '矩形';

export const color = {
    solid: '纯色',
    esc: '按ESC退出',
    recently: '最近使用',
    documentc: '文档使用',
    times: '使用xx次'
}