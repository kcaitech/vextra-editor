import { ShapeType } from "@kcdesign/data";
export const shape: any = {
    group: "编组",
    page: "页面",
    line: '直线',
    oval: '圆形',
    artboard: '容器',
    arrow: '箭头',
    text: '文字'
}
shape[ShapeType.Rectangle] = '矩形';

export const color = {
    solid: '纯色',
    esc: '按ESC退出',
    recently: '最近使用'
}