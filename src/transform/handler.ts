import { Context } from "@/context";
import { XY } from "@/context/selection";
import { WorkSpace } from "@/context/workspace";
import { XYsBounding } from "@/utils/common";
import { AsyncApiCaller, FrameLike, Matrix, PageView, ShapeView } from "@kcdesign/data";

export type OriginStatus = Map<string, FrameLike>;

export class TransformHandler {
    context: Context;
    originStatus: OriginStatus = new Map();
    originSelectionBox: FrameLike;
    shapes: ShapeView[];
    page: PageView;
    referencePoint: XY;
    workspace: WorkSpace;
    shiftStatus: boolean;
    altStatus: boolean;
    alignPixel: boolean;

    horFixedStatus: boolean = false;
    horFixedValue: number = 0;
    verFixedStatus: boolean = false;
    verFixedValue: number = 0;

    asyncApiCaller: AsyncApiCaller | undefined;

    fixedRatioWhileScaling: boolean = false;

    __originFrameCache: Map<string, FrameLike> = new Map();
    __parent2RootMatrixCache: Map<string, Matrix> = new Map();

    constructor(context: Context, shapes: ShapeView[], event: MouseEvent) {
        this.context = context;
        this.shapes = shapes;
        this.initByShapes();
        this.page = context.selection.selectedPage!;
        this.originSelectionBox = this.computeSelectionBox();
        this.referencePoint = context.workspace.getRootXY(event);
        this.shiftStatus = event.shiftKey;
        this.altStatus = event.altKey;
        this.workspace = context.workspace;
        this.alignPixel = context.user.isPixelAlignMent;

        this.beforeTransform();
    }

    initByShapes() {
        for (let i = 0; i < this.shapes.length; i++) {
            const shape = this.shapes[i];

            const _fl = this.__originFrameCache.get(shape.id);
            if (_fl) {
                this.originStatus.set(shape.id, _fl);
                continue;
            }

            if (shape.isVirtualShape) {
                continue;
            }

            if (shape.frameType > 1 && shape.rotation) {
                this.fixedRatioWhileScaling = true;
            }

            const parent = shape.parent;
            if (!parent) {
                continue;
            }

            let m: Matrix = this.__parent2RootMatrixCache.get(parent.id)!;
            if (!m) {
                m = parent.matrix2Root();
                this.__parent2RootMatrixCache.set(parent.id, m);
            }

            const box = shape.boundingBox();

            const lt = m.computeCoord2(box.x, box.y);
            const rb = m.computeCoord2(box.x + box.width, box.y + box.height);

            const frameLike = { x: lt.x, y: lt.y, width: rb.x - lt.x, height: rb.y - lt.y };
            this.originStatus.set(shape.id, frameLike);
            this.__originFrameCache.set(shape.id, frameLike);
        }
    }

    beforeTransform() {
        this.context.menu.menuMount(); // 关闭已打开的弹窗

        this.context.cursor.cursor_freeze(true); // 禁用光标自动变换

        this.workspace.setCtrl('controller'); // 将编辑器控制权交给控件
    }

    computeSelectionBox(): FrameLike {
        let left = Infinity;
        let top = Infinity;
        let right = -Infinity;
        let bottom = -Infinity;

        for (let i = 0; i < this.shapes.length; i++) {
            const shape = this.shapes[i];

            const cacheFrame = this.__originFrameCache.get(shape.id);

            if (cacheFrame) {
                if (cacheFrame.x < left) {
                    left = cacheFrame.x;
                }
                if (cacheFrame.y < top) {
                    top = cacheFrame.y;
                }
                const _right = cacheFrame.x + cacheFrame.width;
                if (_right > right) {
                    right = _right;
                }
                const _bottom = cacheFrame.y + cacheFrame.height;
                if (_bottom > bottom) {
                    bottom = _bottom
                }
            }
            else {
                const frame = shape.frame;

                const m = shape.matrix2Root();

                const points = [
                    { x: 0, y: 0 },
                    { x: frame.width, y: 0 },
                    { x: frame.width, y: frame.height },
                    { x: 0, y: frame.height }
                ].map(p => m.computeCoord3(p));

                const box = XYsBounding(points);

                if (box.left < left) {
                    left = box.left;
                }
                if (box.top < top) {
                    top = box.top;
                }
                if (box.right > right) {
                    right = box.right;
                }
                if (box.bottom > bottom) {
                    bottom = box.bottom;
                }
            }
        }

        return { x: left, y: top, width: right - left, height: bottom - top };
    }

    modifyShiftStatus(v: boolean) {
        this.shiftStatus = v;
    }

    modifyAltStatus(v: boolean) {
        this.altStatus = v;
    }

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