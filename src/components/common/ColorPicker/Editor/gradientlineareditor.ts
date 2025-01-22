import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";
import { GradientType } from "@kcdesign/data";
import { XY } from "@/context/selection";

export type GradientCatch = {
    type: GradientType;
    from: XY;
    to: XY;
    RGBAs: RGBACatch[];
}
