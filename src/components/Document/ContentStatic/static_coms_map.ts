import {ShapeType} from "@kcdesign/data";
import RectangleStatic from "./RectangleStatic.vue";
import ShapeGroupStatic from "./ShapeGroupStatic.vue";

export const static_coms_map = new Map<ShapeType, any>([
    [ShapeType.Rectangle, RectangleStatic],
    [ShapeType.Group, ShapeGroupStatic]
])