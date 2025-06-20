import { Shape, ShapeView } from "@kcdesign/data";

export class ShapeDescContext {
    constructor() {

    }

    map: Map<string, Shape | ShapeView> = new Map();
    srcMap: Map<string, string> = new Map();

    clearCache() {
        this.srcMap.clear();
    }
}