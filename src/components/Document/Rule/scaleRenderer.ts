import { Matrix, PathShapeView, ShapeType, ShapeView } from "@kcdesign/data";
import { XYsBounding } from "@/utils/common";
import { XY } from "@/context/selection";
import { Context } from "@/context";

export interface Scale {
    offset: number;
    data: number;
    opacity: number;
}

export interface Block {
    dataStart: number; // 刻度值
    dataEnd: number;

    offsetStart: number; // 客户端视图偏移值
    offsetEnd: number;

    hidden?: boolean; // 隐藏间距小的端点
}

/**
 * @description 标尺刻度渲染机
 */
export class ScaleRenderer {
    static SCALE_SPACE = 80;

    readonly m_scale_hor: Scale[];
    readonly m_scale_ver: Scale[];
    readonly m_blocks_hor: Block[];
    readonly m_blocks_ver: Block[];
    readonly m_context: Context;

    // 坐标系环境对象
    private coordinateEnv: ShapeView;

    constructor(context: Context, page: ShapeView, sh: Scale[], sv: Scale[], bh: Block[], bv: Block[]) {
        this.m_context = context;
        this.coordinateEnv = page;
        this.m_scale_hor = sh;
        this.m_scale_ver = sv;
        this.m_blocks_hor = bh;
        this.m_blocks_ver = bv;
    }

    /**
     * @description 获取图层所在的环境
     */
    private getContainer(shape: ShapeView) {
        let p = shape.parent;
        while (p) {
            if (p.isContainer) {
                break;
            }
            p = p.parent;
        }
        return p;
    }

    /**
     * @description 合并对象区间
     */
    private mergeBlocks(blocks: Block[]) {
        const len = blocks.length;
        if (len < 2) {
            return blocks;
        }

        blocks.sort((a, b) => a.dataStart > b.dataStart ? 1 : -1);

        const result: Block[] = [blocks[0]];

        for (let i = 1; i < blocks.length; i++) {
            const block = blocks[i];
            const last = result[result.length - 1];

            if (block.dataStart > last.dataEnd) {
                result.push(block);
            } else {
                last.dataEnd = Math.max(block.dataEnd, last.dataEnd);
                last.offsetEnd = Math.max(block.offsetEnd, last.offsetEnd);
            }
        }

        return result;
    }


    /**
     * @description 生成对象区间方块
     */
    private generateBlocksForRule() {
        const bh = this.m_blocks_hor;
        const bv = this.m_blocks_ver;
        bh.length = 0;
        bv.length = 0;
        const ctx = this.m_context;
        const coordinateEnv = this.coordinateEnv;
        // 大于50就不做细节更新了，可以考虑直接把controllerFrame作为结果；
        const shapes = ctx.selection.selectedShapes;
        if (ctx.user.isRuleVisible && shapes.length && shapes.length < 50 && !ctx.workspace.is_path_edit_mode) {
            const blocksX: Block[] = [];
            const blocksY: Block[] = [];

            let offsetX = 0;
            let offsetY = 0;

            const matrix = new Matrix(ctx.workspace.matrix);
            const m00 = matrix.m00;

            if (coordinateEnv.id !== ctx.selection.selectedPage!.id) { // 如果不是根坐标系，则需要变换到特定坐标系
                const frame = coordinateEnv.frame;
                const m2r = coordinateEnv.matrix2Root();
                const points = [
                    m2r.computeCoord2(0, 0),
                    m2r.computeCoord2(frame.width, 0),
                    m2r.computeCoord2(frame.width, frame.height),
                    m2r.computeCoord2(0, frame.height)
                ]
                const box = XYsBounding(points);

                offsetX += box.left;
                offsetY += box.top;
            }

            matrix.trans(offsetX * m00 - 20, offsetY * m00 - 20);
            const inverse = new Matrix(matrix);
            for (let i = 0; i < shapes.length; i++) {
                const shape = shapes[i];

                if (shape.type === ShapeType.Contact) continue;

                const m = shape.matrix2Root();
                m.trans(-offsetX, -offsetY);

                const points: XY[] = [];
                const frame = shape.frame;

                if (shape.isStraight) {
                    m.preScale(frame.width, frame.height);
                    const [start, end] = (shape as PathShapeView)?.segments[0]?.points;
                    if (!start || !end) continue;
                    points.push(m.computeCoord3(start), m.computeCoord3(end));
                } else {
                    const x = frame.x;
                    const y = frame.y;
                    const r = x + frame.width;
                    const b = y + frame.height;
                    points.push(
                        m.computeCoord2(x, y),
                        m.computeCoord2(r, y),
                        m.computeCoord2(r, b),
                        m.computeCoord2(x, b)
                    );
                }

                const { left, top, right, bottom } = XYsBounding(points);


                // 计算客户端视图偏移值
                {
                    const offsetStart = inverse.computeCoord2(left, 0).x;
                    const offsetEnd = inverse.computeCoord2(right, 0).x;

                    const block: Block = {
                        dataStart: left,
                        dataEnd: right,
                        offsetStart,
                        offsetEnd
                    };

                    blocksX.push(block);
                }
                {
                    const offsetStart = inverse.computeCoord2(0, top).y;
                    const offsetEnd = inverse.computeCoord2(0, bottom).y;

                    const block: Block = {
                        dataStart: top,
                        dataEnd: bottom,
                        offsetStart,
                        offsetEnd
                    };

                    blocksY.push(block);
                }
            }

            bh.push(...this.mergeBlocks(blocksX));
            bv.push(...this.mergeBlocks(blocksY));

            // 隐藏间隔距离小的两个端点
            for (let i = 1; i < bh.length; i++) {
                const b = bh[i];
                const last = bh[i - 1];
                if (Math.abs(b.offsetStart - last.offsetEnd) < ScaleRenderer.SCALE_SPACE) b.hidden = true;
            }
            for (let i = 1; i < bv.length; i++) {
                const b = bv[i];
                const last = bv[i - 1];
                if (Math.abs(b.offsetStart - last.offsetEnd) < ScaleRenderer.SCALE_SPACE) b.hidden = true;
            }
        }
    }

    /**
     * @description 修改刻度透明度
     */
    private modifyScaleOpacity() {
        const sh = this.m_scale_hor;
        const sv = this.m_scale_ver;

        const bh = this.m_blocks_hor;
        const bv = this.m_blocks_ver;

        // 重置所有刻度的透明度
        for (let s = 0; s < sh.length; s++) sh[s].opacity = 1;
        for (let s = 0; s < sv.length; s++) sv[s].opacity = 1;

        // 修改靠近Block的刻度的透明度
        for (let s = 0; s < sh.length; s++) {
            const scale = sh[s];
            const offset = scale.offset + 25;

            for (let i = 0; i < bh.length; i++) {
                const b = bh[i];
                const distance = Math.min(Math.abs(offset - b.offsetStart), Math.abs(offset - b.offsetEnd));
                if (distance < ScaleRenderer.SCALE_SPACE) scale.opacity = Math.max((distance - 40) / 40, 0);
            }
        }
        for (let s = 0; s < sv.length; s++) {
            const scale = sv[s];
            const offset = scale.offset + 25;

            for (let i = 0; i < bv.length; i++) {
                const b = bv[i];
                const distance = Math.min(Math.abs(offset - b.offsetStart), Math.abs(offset - b.offsetEnd));
                if (distance < ScaleRenderer.SCALE_SPACE) scale.opacity = Math.max((distance - 40) / 40, 0);
            }
        }
    }

    /**
     * @description 确定坐标系，坐标系一定不能错，错了数据全部会错
     */
    private getCoordinate() {
        const ctx = this.m_context;
        const page = ctx.selection.selectedPage!;
        const shapes = ctx.selection.selectedShapes;

        this.coordinateEnv = page;
        const getC = this.getContainer;

        if (!shapes.length) return; else if (shapes.length === 1) {
            const shape = shapes[0];
            const container = this.getContainer(shape) || page;
            if (shape.isContainer && (container.id === page.id)) {
                this.coordinateEnv = shape;
            } else {
                this.coordinateEnv = container;
            }
        } else {
            this.coordinateEnv = getC(shapes[0]) || page;

            for (let i = 1; i < shapes.length; i++) {
                const env = getC(shapes[i]) || page;

                if (env.id !== this.coordinateEnv.id) {
                    this.coordinateEnv = page; // 存在不同的环境，坐标系直接变为Root;
                    break;
                }
            }
        }
    }

    private getOpacity(distance: number) {
        if (distance > 10) return 1; else {
            return Number(((distance + 30) / 40).toFixed(1));
        }
    }

    /**
     * @description 获取刻度单位
     */
    private getScaleUnit(percent: number) {
        let scale;
        if (percent >= 2 && percent < 5) {
            scale = 2500;
        } else if (percent >= 5 && percent < 10) {
            scale = 1000;
        } else if (percent >= 10 && percent < 20) {
            scale = 500;
        } else if (percent >= 20 && percent < 50) {
            scale = 250;
        } else if (percent >= 50 && percent < 100) {
            scale = 100;
        } else if (percent >= 100 && percent < 200) {
            scale = 50;
        } else if (percent >= 200 && percent < 500) {
            scale = 25;
        } else if (percent >= 500 && percent < 1000) {
            scale = 10
        } else if (percent >= 1000 && percent < 2500) {
            scale = 5;
        } else if (percent >= 2500 && percent < 5000) {
            scale = 2;
        } else {
            scale = 1;
        }
        return scale;
    }

    /**
     * @description 调用场景：Root空间发生变化、选区改变、选区图层发生改变（包括迁移、Transform， transform可以不用重新绘制刻度）；
     */
    render(sim = false) {
        const ctx = this.m_context;

        if (!ctx.user.isRuleVisible) return;
        // 1. 绘制刻度。需要线确定坐标系，并不是每次更新都需要重新确定坐标系和绘制刻度
        if (!sim) {
            this.getCoordinate(); // 确定坐标环境
            let matrix = new Matrix(ctx.workspace.matrix);
            const m00 = matrix.m00;
            const percent = Math.round(m00 * 100);
            const scale = this.getScaleUnit(percent); // 获取坐标刻度，无论在哪个环境，刻度只跟当前视图缩放比例关联

            matrix.trans(-20, -20);

            const env = this.coordinateEnv;

            if (env.id !== ctx.selection.selectedPage!.id) { // 如果不是根坐标系，则需要变换到特定坐标系
                const frame = env.frame;
                const m2r = env.matrix2Root();
                const points = [
                    m2r.computeCoord2(0, 0),
                    m2r.computeCoord2(frame.width, 0),
                    m2r.computeCoord2(frame.width, frame.height),
                    m2r.computeCoord2(0, frame.height)
                ]
                const box = XYsBounding(points);
                matrix.trans(box.left * m00, box.top * m00);
            }

            const inverse = new Matrix(matrix.inverse);
            const { width, height } = ctx.workspace.root;

            const hor = this.m_scale_hor;
            const ver = this.m_scale_ver;

            hor.length = 0;
            ver.length = 0;


            let startX = inverse.computeCoord2(0, 0).x;
            let endX = inverse.computeCoord2(width, 0).x;

            startX -= startX % scale;
            endX += scale - endX % scale;

            let startY = inverse.computeCoord2(0, 0).y;
            let endY = inverse.computeCoord2(0, height).y;

            startY -= startY % scale;
            endY += scale - endY % scale;

            const gO = this.getOpacity;

            for (let data = startX; data < endX; data += scale) {
                const offset = matrix.computeCoord2(data, 0).x - 24.95;

                let scale: Scale = { data, opacity: gO(offset), offset };
                hor.push(scale);
            }

            for (let data = startY; data < endY; data += scale) {
                const offset = matrix.computeCoord2(0, data).y - 24.95;

                let scale: Scale = { data, opacity: gO(offset), offset };
                ver.push(scale);
            }
        }

        // 2. 绘制图层区间方块
        this.generateBlocksForRule();
        // 3. 修改特定刻度的透明度，避免方块的数值和刻度的数值重叠在一起
        this.modifyScaleOpacity();
    }

    clearBlocks() {
        this.m_blocks_ver.length = 0;
        this.m_blocks_hor.length = 0;

        this.modifyScaleOpacity();
    }
}