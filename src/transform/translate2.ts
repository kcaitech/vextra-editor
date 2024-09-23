import { TransformHandler } from "@/transform/handler";
import { Matrix, ShapeView, Transform, Transporter } from "@kcdesign/data";
import { Context } from "@/context";
import { XY } from "@/context/selection";

enum TranslateMode {
    Linear = 'linear',
    Prev = 'prev',
    Flex = 'flex'
}

interface TranslateBaseItem {
    transform: Transform;
    view: ShapeView;
}

interface ViewBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * @description 处理影子数据
 */
class SelectionBox {
    private readonly __fixedBox: ViewBox;
    private readonly offsetX: number;
    private readonly offsetY: number;

    constructor(box: ViewBox, offsetX: number, offsetY: number) {
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.__fixedBox = box;
    }

    livingBox(living: { x: number, y: number }): ViewBox {
        return { x: living.x + this.offsetX, y: living.y + this.offsetY, width: this.__fixedBox.width, height: this.__fixedBox.height };
    }

    updateFixedBox(shapes: ShapeView[]) {

    }
}

/**
 * @description 处理图层迁移操作
 */
class Portal {
    // private __living_env: ShapeView;
    // private __background_env: ShapeView[];
    constructor(shapes: ShapeView[]) {
    }

    private __return() {
    }

    private __migrate() {
    }

    migrate() {
    }
}

/**
 * @description 辅助对齐，网格吸附
 */
class Aligner {

}

/**
 * @description 处理Alt操作
 */
class CMachine {
    constructor(shapes: ShapeView[]) {
    }
}

/**
 * @description 图层样式管理器
 */
class StyleManager {

}

/**
 * @description 自动布局管理器
 */
class AutoLayoutRenderer {

}

export class Translate2 extends TransformHandler {
    // private readonly base: Map<string, TranslateBaseItem>;
    private shapes: ShapeView[];
    private living: XY;

    private api: Transporter | undefined;

    private mode: TranslateMode = TranslateMode.Linear;
    private coping: boolean = false;

    constructor(context: Context, event: MouseEvent, shapes: ShapeView[]) {
        super(context, event);
        this.shapes = shapes;
        this.living = this.workspace.getRootXY(event);
    }

    private init() {
        const cache: Map<string, Matrix> = new Map();

        let left = Infinity;
        let right = -Infinity;
        let top = Infinity;
        let bottom = -Infinity;

        for (const shape of this.shapes) {

        }
    }

    private clone() {
        this.coping = true;
    }

    private swapSel() {
    }

    private connect() {
    }

    private passiveExecute() {
        this.__execute();
    }


    private __linear() {
    }

    private __prev() {
    }

    private __flex() {
    }

    private __execute() {
        switch (this.mode) {
            case TranslateMode.Linear:
                return this.__linear();
            case TranslateMode.Prev:
                return this.__prev();
            case TranslateMode.Flex:
                return this.__flex();
        }
    }

    protected keydown(event: KeyboardEvent) {
        if (event.repeat) return;
        if (event.shiftKey) {
            this.shiftStatus = true;
            this.passiveExecute();
        }
        if (event.altKey) {
            this.altStatus = true;
            this.passiveExecute();
        }
    }

    protected keyup(event: KeyboardEvent) {
        if (event.code === 'ShiftLeft') {
            this.shiftStatus = false;
            this.passiveExecute();
        }
        if (event.code === "AltLeft") {
            this.altStatus = false;
            this.context.selection.setLabelLivingGroup([]);
            this.context.selection.setLabelFixedGroup([]);
            this.context.selection.setShowInterval(false);
        }
    }

    execute(event: MouseEvent) {
        this.living = this.workspace.getRootXY(event);
        this.__execute();
    }
}