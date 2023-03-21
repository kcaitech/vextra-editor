import { ShapeType } from "@kcdesign/data/data/classes";
import Rectangle from "./Rectangle.vue";
import ShapeGroup from "./ShapeGroup.vue"
import ShapePath from "./ShapePath.vue"
import ImageView from "./ImageView.vue"
import TextView from "./TextView.vue";
import SymbolRef from "./SymbolRef.vue";
import ArtboardView from "./ArtboardView.vue"
import ShapeGroupShape from "./ShapeGroupShape.vue"

const comsMap: Map<ShapeType, any> = new Map();

comsMap.set(ShapeType.Artboard, ArtboardView);
comsMap.set(ShapeType.Group, ShapeGroup);
comsMap.set(ShapeType.FlattenShape, ShapeGroupShape);
comsMap.set(ShapeType.Image, ImageView);
comsMap.set(ShapeType.Page, ShapeGroup);
comsMap.set(ShapeType.Path, ShapePath);
comsMap.set(ShapeType.Rectangle, Rectangle);
comsMap.set(ShapeType.Text, TextView);
// comsMap.set(ShapeType.Boolean, ShapeBool);
comsMap.set(ShapeType.Symbol, ShapeGroup);
comsMap.set(ShapeType.SymbolRef, SymbolRef);

export default comsMap;