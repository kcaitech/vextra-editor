import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";
import { Gradient, GradientType } from "@kcdesign/data";
import { XY } from "@/context/selection";

export type GradientCatch = {
    type: GradientType;
    from: XY;
    to: XY;
    RGBAs: RGBACatch[];
}

export function getGradientCatch(g: Gradient): GradientCatch {
    const type = g.gradientType;
    const from = g.from;
    const to = g.to;
    const RGBAs: RGBACatch[] = g.stops.map(stop => ({
        R: stop.color.red,
        G: stop.color.green,
        B: stop.color.blue,
        A: stop.color.alpha,
        position: stop.position
    }));
    return {type, from, to, RGBAs};
}