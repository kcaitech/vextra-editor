import {ShapeType} from "@kcdesign/data";
import RectangleStatic from "./RectangleStatic.vue";
import ShapeGroupStatic from "./ShapeGroupStatic.vue";
import TextViewStatic from "./TextViewStatic.vue";
import ImageViewStatic from "./ImageViewStatic.vue";
import ArtboardViewStatic from "./ArtboardViewStatic.vue";
import TableStatic from "./TableStatic.vue";
import SymbolRefStatic from "./SymbolRefStatic.vue";

export const static_coms_map = new Map<ShapeType, any>([
    [ShapeType.Rectangle, RectangleStatic], // 矩形
    [ShapeType.Oval, RectangleStatic], // 圆形
    [ShapeType.Group, ShapeGroupStatic], // 编组
    [ShapeType.Text, TextViewStatic], // 文字
    [ShapeType.Image, ImageViewStatic], // 图片
    [ShapeType.Artboard, ArtboardViewStatic], // 容器
    [ShapeType.Table, TableStatic], // 表格
    [ShapeType.SymbolRef, SymbolRefStatic] // 组件实例
])