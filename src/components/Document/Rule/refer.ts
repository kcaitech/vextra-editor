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
        this.workspace.translating(false);
        super.fulfil();
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
        const index = this.m_index;
        const currentEnv = this.m_current_env as ArtboradView;
        const gui = currentEnv?.guides?.[index];
        if (!gui) {
            // 不存在这条线
            return;
        }
        const axis = this.m_axis;
        const rootXY = this.workspace.getRootXY(event);

        let offset;

        if (currentEnv.id === this.page.id) {
            if (axis === GuideAxis.X) {
                offset = rootXY.x;
            } else {
                offset = rootXY.y;
            }
        } else {
            const m = new Matrix(currentEnv.matrix2Root().inverse);
            if (axis === GuideAxis.X) {
                offset = m.computeCoord3(rootXY).x;
            } else {
                offset = m.computeCoord3(rootXY).y;
            }
        }
        (this.asyncApiCaller as ReferHandleApiCaller).modifyOffset(adapt2Shape(currentEnv), index, offset, false);
    }

    private __migrate(event: MouseEvent) {
        // todo
    }

    migrateOnce = debounce(this.__migrate, 10);

    // migrateOnce = this.__migrate;

    migrate(e: MouseEvent) {
        this.migrateOnce(e);
    }
}