import {ShapeType} from "@kcdesign/data";
import RectangleStatic from "./RectangleStatic.vue";
import ShapeGroupStatic from "./ShapeGroupStatic.vue";

export const static_coms_map = new Map<ShapeType, any>([
    [ShapeType.Rectangle, RectangleStatic], // 矩形
    [ShapeType.Oval, RectangleStatic], // 圆形
    [ShapeType.Group, ShapeGroupStatic] // 编组
])