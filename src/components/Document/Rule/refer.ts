import { Context } from "@/context";
import { TransformHandler } from "@/transform/handler";
import { Matrix, ReferHandleApiCaller, ShapeType, ShapeView } from "@kcdesign/data";
import { Tool } from "@/context/tool";
import { debounce } from "lodash";
import { XY } from "@/context/selection";

export interface Line {
    axis: "X" | "Y"
    offset: number;
    start: XY;
    end: XY;
}

export interface ReferUnit {
    id: string;
    shape: ShapeView;
    lines: Line[]
}

export class ReferLineHandler extends TransformHandler {
    readonly m_direction: "hor" | "ver";
    readonly tool: Tool;
    private m_index: number = -1;

    constructor(context: Context, event: MouseEvent, direction: "hor" | "ver") {
        super(context, event);
        this.m_direction = direction;
        this.tool = context.tool;
    }

    createApiCaller() {
        this.asyncApiCaller = new ReferHandleApiCaller(this.context.coopRepo, this.context.data, this.page);
        this.workspace.translating(true);
    }

    fulfil() {
        this.workspace.translating(false);
        super.fulfil();
    }

    execute(event: MouseEvent) {
        const isSelected = this.context.tool.selectedLine;
        if (!isSelected) {
            let offset;

            if (this.m_direction === 'hor') {
                offset = this.workspace.getRootXY(event).y;
            } else {
                offset = this.workspace.getRootXY(event).x;
            }
            const cid = (this.asyncApiCaller as ReferHandleApiCaller).create(this.m_direction, offset);
            if (cid !== undefined) {
                this.m_index = cid;
                this.context.tool.selectLine([this.m_direction, cid]);
            }
        } else if (this.m_index > -1) {
            let offsetClient;
            let offset;
            const ref = (this.asyncApiCaller as ReferHandleApiCaller).referId;
            const target = this.page.getShape(ref);
            if (this.m_direction === 'hor') {
                offset = this.workspace.getRootXY(event).y;
                offsetClient = this.workspace.getContentXY(event).y

                if (target) {
                    const m = new Matrix(target.matrix2Root().inverse);
                    offset = m.computeCoord2(0, offset).y;
                }
            } else {
                offsetClient = this.workspace.getContentXY(event).x
                offset = this.workspace.getRootXY(event).x;

                if (target) {
                    const m = new Matrix(target.matrix2Root().inverse);
                    offset = m.computeCoord2(offset, 0).x;
                }
            }

            this.migrate(event);

            (this.asyncApiCaller as ReferHandleApiCaller).modifyOffset(this.m_direction, this.m_index, offset, offsetClient < 20);
        }
    }

    private __migrate(event: MouseEvent) {
        const ctx = this.context;

        const pe = this.workspace.getRootXY(event)
        let target_parent = ctx.selection.getEnvForMigrate(pe);
        let ref = target_parent.id;

        if (target_parent.id === this.page.id) {
            ref = '';
        }

        const rh = this.asyncApiCaller as ReferHandleApiCaller;

        if (ref === rh.referId || (ref && target_parent.parent?.type !== ShapeType.Page) || !target_parent.isNoTransform()) {
            return;
        }

        let offset;

        if (this.m_direction === 'hor') {
            offset = this.workspace.getRootXY(event).y;

            if (ref) {
                const m = new Matrix(target_parent.matrix2Root().inverse);
                offset = m.computeCoord2(0, offset).y;
            }
        } else {
            offset = this.workspace.getRootXY(event).x;

            if (ref) {
                const m = new Matrix(target_parent.matrix2Root().inverse);
                offset = m.computeCoord2(offset, 0).x;
            }
        }

        rh.modifyOffset(this.m_direction, this.m_index, offset, false);
        rh.modifyReferId(this.m_direction, this.m_index, ref);

        ctx.nextTick(ctx.selection.selectedPage!, () => {
            ctx.tool.notify(Tool.RULE_RENDER);
        })
    }

    migrateOnce = debounce(this.__migrate, 10);

    // migrateOnce = this.__migrate;

    migrate(e: MouseEvent) {
        this.migrateOnce(e);
    }
}