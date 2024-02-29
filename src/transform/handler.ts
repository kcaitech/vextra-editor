import { Context } from "@/context";
import { XY } from "@/context/selection";
import { WorkSpace } from "@/context/workspace";
import { boundingBox2Root } from "@/utils/common";
import { AsyncApiCaller, FrameLike, Matrix, PageView, ShapeView } from "@kcdesign/data";

export type OriginStatus = Map<string, FrameLike>;

export type Box = {
    origin: XY;

    baseX: number;
    baseY: number;
    baseWidth: number;
    baseHeight: number;

    boxX: number;
    boxY: number;
    boxWidth: number;
    boxHeight: number;
};

export type BaseFrames = Map<string, Box>;

export class TransformHandler {
    context: Context;
    workspace: WorkSpace;

    originSelectionBox: FrameLike = { x: 0, y: 0, height: 0, width: 0 };
    baseFrames: BaseFrames = new Map();

    shapes: ShapeView[];
    page: PageView;
    referencePoint: XY;

    shiftStatus: boolean;
    altStatus: boolean;
    alignPixel: boolean;
    fixedRatioWhileScaling: boolean = false;

    horFixedStatus: boolean = false;
    horFixedValue: number = 0;
    verFixedStatus: boolean = false;
    verFixedValue: number = 0;

    __parent2RootMatrixCache: Map<string, Matrix> = new Map();
    __baseFramesCache: BaseFrames = new Map();

    asyncApiCaller: AsyncApiCaller | undefined;

    constructor(context: Context, shapes: ShapeView[], event: MouseEvent) {
        this.context = context;
        this.workspace = context.workspace;
        this.shapes = shapes;
        this.page = context.selection.selectedPage!;
        this.referencePoint = context.workspace.getRootXY(event);

        this.shiftStatus = event.shiftKey;
        this.altStatus = event.altKey;
        this.alignPixel = context.user.isPixelAlignMent;

        this.getBaseFrames();
        this.beforeTransform();
    }


    getBaseFrames() {
        const matrixParent2rootCache = new Map();

        let left = Infinity;
        let top = Infinity;
        let right = -Infinity;
        let bottom = -Infinity;

        for (let i = 0; i < this.shapes.length; i++) {
            const shape = this.shapes[i];
            const cache = this.__baseFramesCache.get(shape.id);

            if (cache) {
                continue;
            }

            if (shape.frameType > 1 && shape.rotation) {
                this.fixedRatioWhileScaling = true;
            }

            const f = boundingBox2Root(shape, matrixParent2rootCache);

            if (f.boxX < left) {
                left = f.boxX;
            }

            if (f.boxY < top) {
                top = f.boxY;
            }

            const _right = f.boxX + f.boxWidth
            if (_right > right) {
                right = _right;
            }

            const _bottom = f.boxY + f.boxHeight;
            if (_bottom > bottom) {
                bottom = _bottom;
            }

            this.baseFrames.set(shape.id, f);
            this.__baseFramesCache.set(shape.id, f);
        }

        this.originSelectionBox = { x: left, y: top, width: right - left, height: bottom - top };
    }

    beforeTransform() {
        this.context.menu.menuMount(); // 关闭已打开的弹窗

        this.context.cursor.cursor_freeze(true); // 禁用光标自动变换

        this.workspace.setCtrl('controller'); // 将编辑器控制权交给控件
    }

    modifyShiftStatus(v: boolean) {
        this.shiftStatus = v;
        this.passiveExcute();
    }

    modifyAltStatus(v: boolean) {
        this.altStatus = v;
        this.passiveExcute();
    }

    passiveExcute() { }

    abort() { }

    __fulfil() {
        this.context.assist.reset();

        this.asyncApiCaller?.commit();

        this.workspace.setCtrl('page');

        this.context.cursor.cursor_freeze(false);
    }

    fulfil() {
        this.__fulfil();
        return undefined;
    }
}