import { TableCellView } from "@kcdesign/data";
import { DomBasic } from "./basic";
import { DViewCtx, PropsType, ShapeFrame } from "@kcdesign/data";
import { IMAGE_DEFAULT } from "../common";

export class TableCellDom extends DomBasic(TableCellView) {
    constructor(ctx: DViewCtx, props: PropsType & { frame?: ShapeFrame }) {
        super(ctx, props, IMAGE_DEFAULT);
    }
}