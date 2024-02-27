import { Context } from "@/context";
import { XY } from "@/context/selection";
import { WorkSpace } from "@/context/workspace";
import { XYsBounding } from "@/utils/common";
import { PageView, ShapeView } from "@kcdesign/data";

export type FrameLike = { x: number, y: number, width: number, height: number };

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

    constructor(context: Context, shapes: ShapeView[], event: MouseEvent) {
        this.context = context;
        this.shapes = shapes;
        this.initOriginStatus();
        this.page = context.selection.selectedPage!;
        this.originSelectionBox = this.computeSelectionBox();
        this.referencePoint = context.workspace.getRootXY(event);
        this.shiftStatus = event.shiftKey;
        this.altStatus = event.altKey;
        this.workspace = context.workspace;
        this.alignPixel = context.user.isPixelAlignMent;
    }

    initOriginStatus() {
        for (let i = 0; i < this.shapes.length; i++) {
            const shape = this.shapes[i];
            const frame = shape.frame;
            this.originStatus.set(shape.id, { x: frame.x, y: frame.y, width: frame.width, height: frame.height });
        }
    }

    computeSelectionBox(): FrameLike {
        let left = Infinity;
        let top = Infinity;
        let right = -Infinity;
        let bottom = -Infinity;

        for (let i = 0; i < this.shapes.length; i++) {
            const shape = this.shapes[i];
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

        return { x: left, y: top, width: right - left, height: bottom - top };
    }

    modifyShiftStatus(v: boolean) {
        this.shiftStatus = v;
    }

    modifyAltStatus(v: boolean) {
        this.altStatus = v;
    }

    abort() { }

    fulfil() {
        this.context.assist.reset();
    }
}