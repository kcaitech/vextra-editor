import { Context } from "@/context";
import { ShapeView } from "@kcdesign/data";

export class Clipboard {
    context: Context;

    constructor(context: Context) {
        this.context = context;
    }

    /**
     * @description 处理目标对象
     */
    private encode(target: ShapeView[]) {
    }

    private decode() {
    }

    init() {
    }

    destroy() {
    }
}