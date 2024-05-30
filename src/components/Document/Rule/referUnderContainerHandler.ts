import { ReferUnit } from "@/components/Document/Rule/refer";
import { ArtboradView, GuideAxis, PageView, ShapeView } from "@kcdesign/data";
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

        // todo 更新指定容器下的参考线
        const {shape, lines} = unit;
        if (isShapeOut(this.m_context, shape)) {
            return;
        }
        lines.length = 0;

        const matrix = shape.matrix2Root();
        matrix.multiAtLeft(this.m_context.workspace.matrix);
        const root = this.m_context.workspace.root;
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
                start = {x: offset, y: 0};
                end = {x: offset, y: root.height};
            } else {
                offset = matrix.computeCoord2(0, guide.offset).y;
                if (offset <= 20 || offset >= root.height) continue; // 超出可视范围不绘制
                start = {x: 0, y: offset};
                end = {x: root.width, y: offset};
            }
            lines.push({axis, offset, start, end});
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

        console.log('RENDER TARGET CHANGE:', URCM.size, WUM.size); // 更新了渲染容器对象
    }

    clearContainerWatcher() {
        this.watcherUninstallerMap.forEach((stopFunc) => {
            stopFunc();
        })
        this.watcherUninstallerMap.clear();
    }

    renderAll() {

    }
}