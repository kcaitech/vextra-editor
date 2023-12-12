import { DViewCtx, ImageShapeView, PropsType } from "@kcdesign/data";
import { DomBasic } from "./basic";
import { IMAGE_DEFAULT } from "../common";

export class ImageShapeDom extends DomBasic(ImageShapeView) {

    constructor(ctx: DViewCtx, props: PropsType) {
        super(ctx, props, IMAGE_DEFAULT);
    }
}