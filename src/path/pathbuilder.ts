import { PathShapeView } from "@kcdesign/data";

/**
 * @description todo 路径编辑的控件绘制
 */
export class PathStructBuilder {
    command: (string | number)[] = [];
    view: PathShapeView;

    constructor(view: PathShapeView) {
        this.view = view;
    }

    build() {
        const command: (string | number)[] = [];
    }
}