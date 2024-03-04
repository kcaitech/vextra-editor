import { Context } from "@/context";
import { TransformHandler } from "./handler";
import { FrameLike, Matrix, ShapeView, Transporter } from "@kcdesign/data";
import { XY } from "@/context/selection";

type OriginEnv = {
    env: ShapeView;
    index: number;
}

type OriginEnvs = Map<string, OriginEnv>;

type BaseFrame4Trans = {
    rootXY: XY;
    x: number;
    y: number;
    width: number;
    height: number;
    rotate: number;
    flipH: boolean;
    flipV: boolean;
    parentId: string;
    rotationMatrix: Matrix;
    offsetLivingPointX: number;
    offsetLivingPointY: number;
}

type RootOffsets = Map<string, { dx: number, dy: number }>

export class TranslateHandler extends TransformHandler {
    livingPoint: XY;
    originSelectionBox: FrameLike = { x: 0, y: 0, right: 0, bottom: 0, height: 0, width: 0 };
    boxOffsetLivingPoint: { dx: number, dy: number } = { dx: 0, dy: 0 };

    baseFrames4trans: Map<string, BaseFrame4Trans> = new Map();

    horFixedStatus: boolean = false;
    horFixedValue: number = 0;
    verFixedStatus: boolean = false;
    verFixedValue: number = 0;

    currentEnvId: string = '';
    exceptEnvs: ShapeView[] = [];
    originEnvs: OriginEnvs = new Map();

    constructor(context: Context, shapes: ShapeView[], event: MouseEvent) {
        super(context, shapes, event);

        this.livingPoint = this.workspace.getRootXY(event);

        this.context.assist.set_trans_target(shapes);

        this.getFrames();
    }

    createApiCaller() {
        this.asyncApiCaller = new Transporter(this.context.coopRepo, this.context.data, this.page);

        this.workspace.translating(true);
        this.workspace.setSelectionViewUpdater(false);
    }

    getFrames() {
        const matrixParent2rootCache = new Map<string, Matrix>();
        let left = Infinity;
        let right = -Infinity;
        let top = Infinity;
        let bottom = -Infinity;

        for (let i = 0; i < this.shapes.length; i++) {
            const shape = this.shapes[i];

            const frame = shape.frame;

            const cx = frame.width / 2;
            const cy = frame.height / 2;

            const rotationMatrix = new Matrix();
            rotationMatrix.trans(-cx, -cy);
            if (shape.rotation) {
                rotationMatrix.rotate(shape.rotation / 180 * Math.PI);
            }
            if (shape.isFlippedHorizontal) {
                rotationMatrix.flipHoriz();
            }
            if (shape.isFlippedVertical) {
                rotationMatrix.flipVert();
            }
            rotationMatrix.trans(cx, cy);

            const m = new Matrix(rotationMatrix);
            m.trans(frame.x, frame.y);

            const parent = shape.parent!;

            let parent2rootMatrix = matrixParent2rootCache.get(parent.id)!;
            if (!parent2rootMatrix) {
                parent2rootMatrix = parent.matrix2Root();
                matrixParent2rootCache.set(parent.id, parent2rootMatrix);
            }

            m.multiAtLeft(parent2rootMatrix);

            const rootXY = m.computeCoord2(0, 0);

            this.baseFrames4trans.set(shape.id, {
                rootXY,
                x: frame.x,
                y: frame.y,
                width: frame.width,
                height: frame.height,
                rotate: shape.rotation || 0,
                flipH: !!shape.isFlippedHorizontal,
                flipV: !!shape.isFlippedVertical,
                parentId: parent.id,
                rotationMatrix,
                offsetLivingPointX: rootXY.x - this.livingPoint.x,
                offsetLivingPointY: rootXY.y - this.livingPoint.y
            });

            if (rootXY.x < left) {
                left = rootXY.x;
            }
            if (rootXY.x > right) {
                right = rootXY.x;
            }
            if (rootXY.y < top) {
                top = rootXY.y;
            }
            if (rootXY.y > bottom) {
                bottom = rootXY.y;
            }

            const points = [{ x: frame.width, y: 0 }, { x: frame.width, y: frame.height }, { x: 0, y: frame.height }];
            for (let i = 0; i < 3; i++) {
                const p = m.computeCoord3(points[i]);
                if (p.x < left) {
                    left = p.x;
                }
                if (p.x > right) {
                    right = p.x;
                }
                if (p.y < top) {
                    top = p.y;
                }
                if (p.y > bottom) {
                    bottom = p.y;
                }
            }
        }

        this.originSelectionBox = {
            x: left,
            y: top,
            right,
            bottom,
            width: right - left,
            height: bottom - top,
        };

        this.boxOffsetLivingPoint.dx = this.livingPoint.x - left;
        this.boxOffsetLivingPoint.dy = this.livingPoint.y - top;
    }
}