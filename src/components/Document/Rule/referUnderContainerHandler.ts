import { genPath, ReferUnit } from "@/components/Document/Rule/refer";
import { ArtboradView, GuideAxis, isNoTransform, PageView, ShapeView } from "@kcdesign/data";
import { isShapeOut } from "@/utils/assist";
import { Context } from "@/context";
import { XY } from "@/context/selection";

/**
 * @description 容器内参考线渲染机
 */
export class ReferUnderContainerHandler {
    private readonly m_context: Context;
    private readonly m_units: ReferUnit[];
    private readonly m_page: PageView;

    constructor(context: Context, units: ReferUnit[], page: PageView) {
        this.m_context = context;
        this.m_units = units;
        this.m_page = page;
    }

    // 已监听的Container对象
    underRootContainerMap = new Map<string, ShapeView>();
    // 对象监听卸载函数集合
    watcherUninstallerMap = new Map<string, () => void>();

    /**
     * @description 更新指定Container的参考线绘制
     */
    updateContainerLineRender(id: string, args: any) {
        if (!(args && args?.includes('layout'))) {
            return;
        }

        // 寻找修改对象
        const units = this.m_units;
        let unit: ReferUnit | undefined = undefined;

        for (let i = 0; i < units.length; i++) {
            const u = units[i];
            if (u.id === id) {
                unit = u as ReferUnit;
                break;
            }
        }

        if (!unit) {
            return;
        }

        const { shape, lines } = unit;
        lines.length = 0;

        if (isShapeOut(this.m_context, shape) || !shape.isNoTransform()) {
            return;
        }

        const matrix = shape.matrix2Root();
        matrix.multiAtLeft(this.m_context.workspace.matrix);

        const frame = shape.frame;
        const root = this.m_context.workspace.root;
        const guides = (shape as ArtboradView).guides || [];
        for (let i = 0; i < guides.length; i++) {
            const guide = guides[i];
            let start: XY;
            let end: XY;
            const axis = guide.axis;
            if (axis === GuideAxis.X) {
                if (guide.offset < 0) continue;

                start = matrix.computeCoord2(guide.offset, 0);
                end = matrix.computeCoord2(guide.offset, frame.height);

                if (start.x <= 20 || start.x >= root.width) continue; // 超出可视范围不绘制
            } else {
                if (guide.offset < 0) continue;

                start = matrix.computeCoord2(0, guide.offset);
                end = matrix.computeCoord2(frame.width, guide.offset);

                if (start.y <= 20 || start.y >= root.height) continue; // 超出可视范围不绘制
            }
            lines.push({ axis, offset: guide.offset, start, end, path: genPath(start, end) });
        }
        // console.log('=REPAINT=', shape.name);
    }

    updateByMatrix() {
        for (let i = 0; i < this.m_units.length; i++) {
            const unit = this.m_units[i];
            const { shape, lines } = unit;

            lines.length = 0;

            if (isShapeOut(this.m_context, shape) || !shape.isNoTransform()) {
                continue;
            }

            const matrix = shape.matrix2Root();
            matrix.multiAtLeft(this.m_context.workspace.matrix);

            const frame = shape.frame;
            const root = this.m_context.workspace.root;
            const guides = (shape as ArtboradView).guides || [];
            for (let i = 0; i < guides.length; i++) {
                const guide = guides[i];
                let start: XY;
                let end: XY;
                const axis = guide.axis;
                if (axis === GuideAxis.X) {
                    if (guide.offset < 0) continue;

                    start = matrix.computeCoord2(guide.offset, 0);
                    end = matrix.computeCoord2(guide.offset, frame.height);

                    if (start.x <= 20 || start.x >= root.width) continue; // 超出可视范围不绘制
                } else {
                    if (guide.offset < 0) continue;

                    start = matrix.computeCoord2(0, guide.offset);
                    end = matrix.computeCoord2(frame.width, guide.offset);

                    if (start.y <= 20 || start.y >= root.height) continue; // 超出可视范围不绘制
                }
                lines.push({ axis, offset: guide.offset, start, end, path: genPath(start, end) });
            }
        }
    }

    /**
     * @description 更新监听目标
     */
    updateUnderRootContainerMap() {
        const page = this.m_page;
        const children = page.childs;
        const URCM = this.underRootContainerMap;
        const WUM = this.watcherUninstallerMap;
        const UCLR = this.updateContainerLineRender.bind(this);

        URCM.clear();

        for (let i = 0; i < children.length; i++) {
            const c = children[i];
            if (!c.isContainer || (c.rotation || 0) % 180) {
                continue;
            }
            URCM.set(c.id, c);
            if (!WUM.has(c.id)) {
                WUM.set(c.id, c.watch((...args) => {
                    UCLR(c.id, args)
                }));
            }
        }

        WUM.forEach((stopFunc, key) => {
            if (!URCM.has(key)) {
                stopFunc();
                WUM.delete(key);
            }
        })

        const temp = [...this.m_units];
        this.m_units.length = 0;
        const added = new Set<string>();
        // 在这个过程中，把更新监听对象前有的Unit直接push回去
        for (let i = 0; i < temp.length; i++) {
            const c = temp[i];
            if (URCM.has(c.id)) {
                this.m_units.push(c);
                added.add(c.id);
            }
        }

        // 更新后如果有新的Unit，则需要额外生成
        URCM.forEach((shape) => {
            if (!added.has(shape.id)) {
                this.generateUnit(shape);
            }
        })

        console.log('RENDER TARGET CHANGE:', URCM.size, WUM.size, this.m_units.length, this.m_units); // 更新了渲染容器对象
    }

    clearContainerWatcher() {
        this.watcherUninstallerMap.forEach((stopFunc) => {
            stopFunc();
        })
        this.watcherUninstallerMap.clear();
    }

    generateUnit(shape: ShapeView) {
        const unit: ReferUnit = { shape: shape, id: shape.id, lines: [] };
        this.m_units.push(unit);

        if (isShapeOut(this.m_context, shape)) { // 可视区域外不需要绘制
            return;
        }

        const matrix = shape.matrix2Root();
        matrix.multiAtLeft(this.m_context.workspace.matrix);
        const root = shape.frame;
        const guides = (shape as ArtboradView).guides || [];
        for (let i = 0; i < guides.length; i++) {
            const guide = guides[i];
            let offset;
            let start: XY;
            let end: XY;
            const axis = guide.axis;
            if (axis === GuideAxis.X) {
                offset = matrix.computeCoord2(guide.offset, 0).x;
                if (offset <= 20 || offset >= root.width) continue; // 超出可视范围不绘制
                start = { x: offset, y: 0 };
                end = { x: offset, y: root.height };
            } else {
                offset = matrix.computeCoord2(0, guide.offset).y;
                if (offset <= 20 || offset >= root.height) continue; // 超出可视范围不绘制
                start = { x: 0, y: offset };
                end = { x: root.width, y: offset };
            }
            unit.lines.push({ axis, offset, start, end, path: genPath(start, end) });
        }
    }
}