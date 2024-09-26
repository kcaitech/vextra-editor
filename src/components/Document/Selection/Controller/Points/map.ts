import PointsContainerForPolygon from "./PointsContainerForPolygon.vue";
import PointContainerForStar from "./PointContainerForStar.vue";
import PointContainerForRect from "./PointContainerForRect.vue";
import PointContainerForOval from "./PointContainerForOval.vue";
import { ShapeType } from "@kcdesign/data";

export const point_map = new Map<ShapeType, any>([
    [ShapeType.Polygon, PointsContainerForPolygon],
    [ShapeType.Star, PointContainerForStar],
    [ShapeType.Rectangle, PointContainerForRect],
    [ShapeType.Image, PointContainerForRect],
    [ShapeType.Oval, PointContainerForOval],
])