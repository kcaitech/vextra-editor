import { GradientType } from "@kcdesign/data";
import Linear from "./Linear.vue";
import Radial from "./Radial.vue";
import Angular from "./Angular.vue";
export const gradient_map = new Map<GradientType, any>([
    [GradientType.Linear, Linear],
    [GradientType.Radial, Radial],
    [GradientType.Angular, Angular],
])