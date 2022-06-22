import Rectangle from "./Rectangle.vue";
import ShapeGroup from "./ShapeGroup.vue"
import ShapePath from "./ShapePath.vue"
import ImageView from "./ImageView.vue"
import { ShapeType } from "../data/shape";
import TextView from "./TextView.vue";
import ShapeBool from "./ShapeBool.vue";

const comsMap: Map<ShapeType, any> = new Map();

comsMap.set(ShapeType.Artboard, ShapeGroup);
comsMap.set(ShapeType.Group, ShapeGroup);
comsMap.set(ShapeType.Image, ImageView);
comsMap.set(ShapeType.Page, ShapeGroup);
comsMap.set(ShapeType.Path, ShapePath);
comsMap.set(ShapeType.Rectangle, Rectangle);
comsMap.set(ShapeType.Text, TextView);
comsMap.set(ShapeType.Boolean, ShapeBool);

export default comsMap;