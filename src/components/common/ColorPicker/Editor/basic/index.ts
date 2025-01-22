import { Context } from "@/context";
import { ShapeView } from "@kcdesign/data";


export class SelectionCtx {
    protected selected: ShapeView[];
    protected flat: ShapeView[];

    constructor(public context: Context) {
        this.selected = [];
        this.flat = [];
    }

    getSelection() {
        this.selected = this.context.selection.selectedShapes;
        this.flat = this.context.selection.flat;
    }
}