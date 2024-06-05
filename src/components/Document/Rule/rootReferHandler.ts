import { genPath, ReferUnit } from "@/components/Document/Rule/refer";
import { Context } from "@/context";
import { PageView, GuideAxis } from "@kcdesign/data";
import { XY } from "@/context/selection";

/**
 * @description 页面下参考线渲染 V1.0
 */
export class RootReferHandler {
    private m_lines: ReferUnit;
    private m_context: Context;
    private m_page: PageView;

    constructor(ctx: Context, page: PageView, rootLines: ReferUnit) {
        this.m_context = ctx;
        this.m_lines = rootLines;
        this.m_page = page;
    }

    /**
     * @description 渲染Root下的参考线
     * @param index
     */
    render(index = -1) {
        const matrix = this.m_context.workspace.matrix;
        const root = this.m_context.workspace.root;
        const lines = this.m_lines.lines;

        if (index > -1) {
            // todo 该场景暂时没有比较好的局部更新方案
        } else { // 全量更新
            lines.length = 0;
            const guides = this.m_page.guides || [];
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
                lines.push({
                    index: i,
                    id: `page-id-/${i}`,
                    axis,
                    offset: guide.offset,
                    start,
                    end,
                    path: genPath(start, end)
                });
            }
        }
    }

    updatePage(page: PageView) {
        this.m_page = page;
    }
}