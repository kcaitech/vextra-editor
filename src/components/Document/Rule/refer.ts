import { Context } from "@/context";
import { TransformHandler } from "@/transform/handler";
import {
    adapt2Shape,
    ArtboradView,
    GuideAxis,
    Matrix,
    ReferHandleApiCaller,
    ShapeView
} from "@kcdesign/data";
import { Tool } from "@/context/tool";
import { debounce } from "lodash";
import { XY } from "@/context/selection";
import { isShapeOut } from "@/utils/assist";

export interface Line {
    axis: GuideAxis;
    offset: number;
    start: XY;
    end: XY;
    path: string;
}

export interface ReferUnit {
    id: string;
    shape: ShapeView;
    lines: Line[]
}

export function genPath(start: XY, end: XY) {
    return `M${start.x} ${start.y} L${end.x} ${end.y}`;
}

export class ReferLineHandler extends TransformHandler {
    readonly m_axis: GuideAxis;
    readonly tool: Tool;
    private m_current_env: ShapeView;
    private m_index: number;
    private livingXY: XY = { x: 0, y: 0 };

    constructor(context: Context, event: MouseEvent, axis: GuideAxis, env?: ShapeView, index?: number) {
        super(context, event);
        this.m_axis = axis;
        this.tool = context.tool;

        if (env) {
            this.m_current_env = env;
        } else {
            this.m_current_env = this.page;
        }

        this.m_index = index ?? -1;
    }

    createApiCaller() {
        this.asyncApiCaller = new ReferHandleApiCaller(this.context.coopRepo, this.context.data, this.page);
        this.workspace.translating(true);
    }

    fulfil() {
        this.__migrate();
        this.workspace.translating(false);
        super.fulfil();
    }

    private envSearch() {
        let env = this.page;
        const children = this.page.childs;
        for (let i = children.length - 1; i > -1; i--) {
            const child = children[i];
            if (!child.isContainer || !child.isNoTransform() || isShapeOut(this.context, child)) {
                continue
            }

            const r = this.context.selection.scout.isPointInShape(child, this.livingXY);
            if (r) {
                return child;
            }
        }
        return env;
    }

    /**
     * @description 默认都在Page下创建
     * @param event
     */
    create(event: MouseEvent) {
        let offset;
        if (this.m_axis === GuideAxis.X) {
            offset = this.workspace.getRootXY(event).x;
        } else {
            offset = this.workspace.getRootXY(event).y;
        }
        this.m_index = (this.asyncApiCaller as ReferHandleApiCaller).create(this.m_axis, offset);
    }

    modifyOffset(event: MouseEvent) {
        this.livingXY = this.workspace.getRootXY(event);
        const __root_xy = this.livingXY;

        const index = this.m_index;
        const currentEnv = this.m_current_env as ArtboradView;
        const gui = currentEnv?.guides?.[index];
        if (!gui) {
            // 不存在这条线
            return;
        }
        const axis = this.m_axis;

        this.migrate();

        let offset;

        if (currentEnv.id === this.page.id) {
            if (axis === GuideAxis.X) {
                offset = __root_xy.x;
            } else {
                offset = __root_xy.y;
            }
        } else {
            const m = new Matrix(currentEnv.matrix2Root().inverse);
            if (axis === GuideAxis.X) {
                offset = m.computeCoord3(__root_xy).x;
            } else {
                offset = m.computeCoord3(__root_xy).y;
            }
        }

        (this.asyncApiCaller as ReferHandleApiCaller).modifyOffset(adapt2Shape(currentEnv), index, offset, false);
    }

    private __migrate() {
        const env = this.envSearch();
        if (env.id === this.m_current_env.id) {
            return;
        }
        if (env.id === this.page.id) {
            // to page
            return;
        }

        // 一定要是在页面下的容器
        if (env.parent?.id !== this.page.id || !env.isNoTransform()) {
            return;
        }

        const guide = (this.m_current_env as ArtboradView).guides?.[this.m_index];
        if (!guide) {
            return;
        }

        let targetOffset;
        if (this.m_current_env.id === this.page.id) {
            const m = new Matrix(env.matrix2Root().inverse);

            if (guide.axis === GuideAxis.X) {
                targetOffset = m.computeCoord2(guide.offset, 0).x;
            } else {
                targetOffset = m.computeCoord2(0, guide.offset).y;
            }
        } else {
            const m1 = this.m_current_env.matrix2Root();
            const m2 = new Matrix(env.matrix2Root().inverse);

            if (guide.axis === GuideAxis.X) {
                let _temp = m1.computeCoord2(guide.offset, 0).x;
                targetOffset = m2.computeCoord2(_temp, 0).x;
            } else {
                let _temp = m1.computeCoord2(0, guide.offset).y;
                targetOffset = m2.computeCoord2(0, _temp).y;
            }
        }

        const result = (this.asyncApiCaller as ReferHandleApiCaller).migrate(this.m_current_env, this.m_index, env, targetOffset);

        this.m_current_env = result.env;
        this.m_index = result.index
    }

    migrateOnce = debounce(this.__migrate, 20);

    migrate() {
        this.migrateOnce();
    }
}