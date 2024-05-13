import { GradientType, ShapeType } from "@kcdesign/data";
export const shape: any = {
    group: "编组",
    page: "页面",
    line: '直线',
    oval: '圆形',
    rect: '矩形',
    path: '路径',
    artboard: '容器',
    arrow: '箭头',
    text: '文字',
    image: '图片',
    input_text: '输入文本',
    table: '表格',
    contact: '连接线',
    cutout: '切图',
    shape_tool: '形状工具',
    symbol: '组件',
    curve: "曲线工具",
    clip: "裁剪工具",
    default: '默认',
    pen: '钢笔',
    pencil: '铅笔',
    polygon: '多边形',
    star: '星形',
}
shape[ShapeType.Rectangle] = '矩形';

export const color = {
    solid: '纯色',
    linear: '线性渐变',
    radial: '径向渐变',
    angular: '旋转渐变',
    esc: '按ESC退出',
    recently: '最近使用',
    documentc: '文档使用',
    times: '使用xx次',
    rotate: '旋转90度',
    reverse: '翻转渐变'
}
color[GradientType.Linear] = '线性渐变';
color[GradientType.Radial] = '径向渐变';
color[GradientType.Angular] = '旋转渐变';