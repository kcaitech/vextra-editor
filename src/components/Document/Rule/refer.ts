import { Context } from "@/context";
import { TransformHandler } from "@/transform/handler";
import { ArtboradView, GuideAxis, Matrix, ReferHandleApiCaller, ShapeView } from "@kcdesign/data";
import { XY } from "@/context/selection";
import { isShapeOut } from "@/utils/assist";

export interface Line {
    id: string;
    axis: GuideAxis;
    offset: number;
    start: XY;
    end: XY;
    path: string;
    index: number;
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
    return Math.abs(v % 1) > 0.009 ? v.toFixed(2) : Math.round(v);
}

export class ReferLineHandler extends TransformHandler {
    m_index: number;
    readonly m_axis: GuideAxis;

    private m_current_env: ShapeView;
    private livingXY: XY = { x: 0, y: 0 };

    constructor(context: Context, axis: GuideAxis, env?: ShapeView, index?: number) {
        super(context);
        this.m_axis = axis;

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

    createApiCaller(event: MouseEvent, index?: number) {
        if (this.asyncApiCaller) {
            return;
        }
        this.asyncApiCaller = new ReferHandleApiCaller(this.context.coopRepo, this.context.data, this.page);
        this.workspace.translating(true);

        if (index === undefined) {
            let offset;
            if (this.m_axis === GuideAxis.X) {
                offset = this.workspace.getRootXY(event).x;
            } else {
                offset = this.workspace.getRootXY(event).y;
            }

            // 默认在page下建立新参考线
            this.m_index = this.api.create(this.m_axis, offset);
            this.context.tool.referSelection.modifyHoveredIndex(this.page, this.m_index, this.m_axis);
        }

        this.context.assist.set_collect_target_direct(this.m_current_env, true, true);
    }

    fulfil() {
        this.workspace.translating(false);
        super.fulfil();
        this.asyncApiCaller = undefined;
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

    // align
    private horFixedStatus: boolean = false;
    private horFixedValue: number = 0;
    private verFixedStatus: boolean = false;
    private verFixedValue: number = 0;

    private updateHorFixedStatus(livingX: number, assistResult: { x: number, sticked_by_x: boolean }) {
        const stickness = this.context.assist.stickness;
        if (this.horFixedStatus) {
            if (Math.abs(livingX - this.horFixedValue) >= stickness) {
                this.horFixedStatus = false;
            } else {
                if (this.horFixedValue !== assistResult.x) {
                    this.horFixedValue = assistResult.x;
                }
            }
        } else if (assistResult.sticked_by_x) {
            this.horFixedStatus = true;
            this.horFixedValue = assistResult.x;
        }
    }

    private updateVerFixedStatus(livingY: number, assistResult: { y: number, sticked_by_y: boolean }) {
        const stickness = this.context.assist.stickness;
        if (this.verFixedStatus) {
            if (Math.abs(livingY - this.verFixedValue) >= stickness) {
                this.verFixedStatus = false;
            } else {
                if (this.verFixedValue !== assistResult.y) {
                    this.verFixedValue = assistResult.y;
                }
            }
        } else if (assistResult.sticked_by_y) {
            this.verFixedStatus = true;
            this.verFixedValue = assistResult.y;
        }
    }


    modifyOffset(event: MouseEvent) {
        this.livingXY = this.workspace.getRootXY(event);

        const __root_xy = this.livingXY;
        if (this.alignPixel) {
            __root_xy.x = Math.round(__root_xy.x);
            __root_xy.y = Math.round(__root_xy.y);
        }

        if (this.m_axis === GuideAxis.X) {
            const target = this.context.assist.alignX(__root_xy, [], false);
            if (target) {
                this.updateHorFixedStatus(__root_xy.x, target);
                if (this.horFixedStatus) {
                    __root_xy.x = this.horFixedValue;
                }
            }

        } else {
            const target = this.context.assist.alignY(__root_xy, [], false);
            if (target) {
                this.updateVerFixedStatus(__root_xy.y, target);

                if (this.verFixedStatus) {
                    __root_xy.y = this.verFixedValue;
                }
            }
        }

        const index = this.m_index;
        const currentEnv = this.m_current_env as ArtboradView;

        // console.log('currentEnv&index', currentEnv.name, index);

        if (!currentEnv?.guides?.[index]) {
            // 不存在这条线
            return;
        }

        const contentXY = this.workspace.getContentXY(event);
        const axis = this.m_axis;

        let needRecovery = false;
        if (axis === GuideAxis.X) {
            needRecovery = contentXY.x < 20;
        } else {
            needRecovery = contentXY.y < 20;
        }

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

        this.api.modifyOffset(currentEnv, index, offset, needRecovery);

        this.migrate();
    }

    modifyOffsetByKeyboard(del: number) {
        if (!this.asyncApiCaller) {
            this.asyncApiCaller = new ReferHandleApiCaller(this.context.coopRepo, this.context.data, this.page);
        }

        const index = this.m_index;
        const currentEnv = this.m_current_env as unknown as ArtboradView;


        const gui = currentEnv?.guides?.[index];

        if (!gui) {
            // 不存在这条线
            return;
        }

        this.api.modifyOffset(currentEnv, index, gui.offset + del, false);
    }

    private migrate() {
        const env = this.envSearch();

        const _o_env = this.m_current_env as unknown as ArtboradView;

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
        this.m_index = result.index;
        // console.log('__migrate__', result.env.name, result.index);
        this.context.tool.referSelection.modifyHoveredIndex(result.env, result.index, this.m_axis);

        this.context.assist.set_collect_target_direct(this.m_current_env, true, true);
    }

    delete(env: ShapeView, index: number) {
        this.asyncApiCaller = new ReferHandleApiCaller(this.context.coopRepo, this.context.data, this.page);
        this.api.delete(env, index);
        super.fulfil();
    }
}