import { Context } from "@/context";
import { TransformHandler } from "@/transform/handler";
import {
    ArtboradView,
    GuideAxis,
    Matrix,
    ReferHandleApiCaller,
    ShapeView
} from "@kcdesign/data";
import { Tool } from "@/context/tool";
import { XY } from "@/context/selection";
import { isShapeOut } from "@/utils/assist";

export interface Line {
    id: string;
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

export function formatNumber(v: number) {
    return Math.abs(v % 1) > 0.01 ? v.toFixed(2) : Math.round(v);
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

    get api() {
        return this.asyncApiCaller as ReferHandleApiCaller;
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

        // 按层级从上到下寻找
        for (let i = children.length - 1; i > -1; i--) {
            const child = children[i];
            if (!child.isContainer || (child.rotation || 0) % 180 || isShapeOut(this.context, child)) {
                continue
            }

            const r = this.context.selection.scout.isPointInShape(child, this.livingXY);
            if (r) {
                return child;
            }
        }

        // 保底是在页面环境内
        return env;
    }

    /**
     * @description 默认都在Page下创建
     */
    create(event: MouseEvent) {
        let offset;
        if (this.m_axis === GuideAxis.X) {
            offset = this.workspace.getRootXY(event).x;
        } else {
            offset = this.workspace.getRootXY(event).y;
        }

        this.m_index = this.api.create(this.m_axis, offset);
    }

    modifyOffset(event: MouseEvent) {
        this.livingXY = this.workspace.getRootXY(event);

        const __root_xy = this.livingXY;

        if (this.context.user.isPixelAlignMent) {
            // 取整
            __root_xy.x = Math.round(__root_xy.x);
            __root_xy.y = Math.round(__root_xy.y);
        }

        const index = this.m_index;
        const currentEnv = this.m_current_env as ArtboradView;

        const gui = currentEnv?.guides?.[index];
        if (!gui) {
            // 不存在这条线
            return;
        }

        const axis = this.m_axis;

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

        this.api.modifyOffset(currentEnv, index, offset, false);

        this.migrate();
    }

    private __migrate() {
        const env = this.envSearch();

        const _o_env = this.m_current_env as ArtboradView;

        if (env.id === _o_env.id) return;

        let targetOffset;

        const guide = _o_env.guides?.[this.m_index];
        if (!guide) return;

        if (env.id === this.page.id) {  // 容器迁页面
            if (guide.axis === GuideAxis.X) {
                targetOffset = _o_env.matrix2Root().computeCoord2(guide.offset, 0).x;
            } else {
                targetOffset = _o_env.matrix2Root().computeCoord2(0, guide.offset).y;
            }
        } else {
            if (env.parent?.id !== this.page.id || !env.isNoTransform()) return;

            if (_o_env.id === this.page.id) {  // 页面迁容器
                const m = new Matrix(env.matrix2Root().inverse);

                if (guide.axis === GuideAxis.X) {
                    targetOffset = m.computeCoord2(guide.offset, 0).x;
                } else {
                    targetOffset = m.computeCoord2(0, guide.offset).y;
                }
            } else { // 容器迁容器
                const m1 = _o_env.matrix2Root();
                const m2 = new Matrix(env.matrix2Root().inverse);

                if (guide.axis === GuideAxis.X) {
                    let _temp = m1.computeCoord2(guide.offset, 0).x;
                    targetOffset = m2.computeCoord2(_temp, 0).x;
                } else {
                    let _temp = m1.computeCoord2(0, guide.offset).y;
                    targetOffset = m2.computeCoord2(0, _temp).y;
                }
            }
        }

        const result = this.api.migrate(this.m_current_env, this.m_index, env, targetOffset);

        this.m_current_env = result.env;
        this.m_index = result.index
    }

    // migrateOnce = debounce(this.__migrate, 20); // 延时迁移
    migrateOnce = this.__migrate;

    migrate() {
        this.migrateOnce();
    }
}