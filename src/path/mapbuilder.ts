import { PathShapeView } from "@kcdesign/data";

/**
 * @description todo 钢笔路径骨架建造器
 */
export class MapBuilder {
    view: PathShapeView;

    constructor(view: PathShapeView) {
        this.view = view;
    }

    build() {
        const command: (string | number)[] = [];
    }
}