import { TransformHandler } from "@/transform/handler";
import { ArtboradView, Matrix, Shape, ShapeView, Transform, TransformRaw, Transporter } from "@kcdesign/data";
import { Context } from "@/context";
import { XY } from "@/context/selection";

enum TranslateMode {
    Linear = 'linear',
    Prev = 'prev',
    Flex = 'flex'
}

interface TranslateBaseItem {
    transform: TransformRaw;
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
class ShapesManager {
    private readonly bases: Map<string, TranslateBaseItem>;
    private __shapes: ShapeView[];
    private transport: Translate2;
    private __coping: boolean;
    private context: Context;

    constructor(transport: Translate2, context: Context, shapes: ShapeView[]) {
        // 如果多选图层中包含了虚拟图层，需要把虚拟图层冒泡的其最近实体上，并将该实体替换到选区
        const __real_view = (view: ShapeView) => {
            while (view.parent) {
                view = view.parent;
                if (!view.isVirtualShape) break;
            }
            return view;
        }
        for (const view of shapes) {
            let needSortSel = false;
            const __shapes = new Set<ShapeView>();
            if (view.isVirtualShape) {
                __shapes.add(__real_view(view));
                needSortSel = true;
            } else __shapes.add(view);
            if (needSortSel) {
                shapes = Array.from(__shapes.values());
                context.selection.rangeSelectShape(shapes);
            }
        }

        // 如果多选图层中既包含了自动布局内的图层，也包含了其他自由图层，则将选区过滤为自由图层选区
        let isMixed = false;
        const __is_under_auto_layout = (view: ShapeView) => {
            let parent = view.parent;
            while (parent) {
                if ((parent as ArtboradView)?.autoLayout) return 1;
                parent = parent.parent;
            }
            return -1;
        }
        for (let i = 1; i < shapes.length; i++) {
            const last = __is_under_auto_layout(shapes[i - 1]);
            const current = __is_under_auto_layout(shapes[i]);

            isMixed = last + current === 0;
            if (isMixed) break;
        }
        if (isMixed) {
            const __shapes = [];
            for (const view of shapes) {
                if (__is_under_auto_layout(view) > 0) continue;
                __shapes.push(view);
            }
            shapes = [...__shapes];
            context.selection.rangeSelectShape(shapes);
            transport.mode = TranslateMode.Linear;
        }

        const map = new Map<string, TranslateBaseItem>();
        for (const view of shapes) {
            const transform = view.transform.clone();
            map.set(view.id, { view, transform });
        }

        this.bases = map;
        this.__coping = false;
        this.context = context;
        this.__shapes = shapes;
        this.transport = transport;
    }

    get coping() {
        return this.__coping;
    }

    get shapes() {
        return this.__shapes;
    }

    drawn(reset = true) {
        this.__coping = true;
        let results: Shape[] | undefined;
        if (reset) {
            const transforms: TransformRaw[] = [];
            this.bases.forEach(i => transforms.push(i.transform));
            results = this.transport.api!.drawn(this.__shapes, transforms)!;
        } else {
            results = this.transport.api!.drawn(this.__shapes)!;
        }

        const page = this.context.selection.selectedPage!;
        this.context.nextTick(page, () => {
            const selects: ShapeView[] = [];
            results.forEach((s) => {
                const v = page.shapes.get(s.id);
                if (v) selects.push(v);
            })
            this.__shapes = [...selects];
            this.context.selection.rangeSelectShape(this.__shapes);
            this.__coping = false;
        });
    }

    get baseShapes() {
        const shapes: ShapeView[] = [];
        this.bases.forEach(i => shapes.push(i.view));
        return shapes;
    }

    revert() {
        const shapes = this.__shapes;
        const baseShapes = this.baseShapes;
        this.transport.api!.revert(shapes, baseShapes);
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
    private living: XY;
    private coping: boolean = false;
    private shapeManager: ShapesManager;

    constructor(context: Context, event: MouseEvent, shapes: ShapeView[]) {
        super(context, event);
        this.living = this.workspace.getRootXY(event);
        this.shapeManager = new ShapesManager(this, context, shapes);
    }

    private __mode: TranslateMode = TranslateMode.Linear;

    set mode(m: TranslateMode) {
        this.__mode = m;
    }

    get mode() {
        return this.__mode;
    }

    private __api: Transporter | undefined;

    get api() {
        return this.__api;
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
        switch (this.__mode) {
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