import { TransformHandler } from "@/transform/handler";
import { Context } from "@/context";
import { adapt2Shape, ArtboradView, AutoLayoutModify, GroupShape, GroupShapeView, PaddingDir, ShapeView, Transporter } from "@kcdesign/data";
import { debounce } from "lodash";
import { Tool } from "@/context/tool";
import { compare_layer_3 } from "@/utils/group_ungroup";
import { PageXY, XY } from "@/context/selection";
import { find_except_envs, record_origin_env } from "@/utils/migrate";

export class AutoLayoutHandler extends TransformHandler {
    readonly shapes: ShapeView[] = [];
    isTransApi: boolean = false;
    fixedPoint: XY = { x: 0, y: 0 };

    constructor(context: Context, event: MouseEvent) {
        super(context, event);

        this.shapes = context.selection.selectedShapes;
    }

    createApiCaller(downXY?: XY) {
        this.asyncApiCaller = new AutoLayoutModify(this.context.coopRepo, this.context.data, this.page);
        this.isTransApi = false;
        this.fixedPoint = downXY || { x: 0, y: 0 };
    }
    createTransApiCaller() {
        this.asyncApiCaller = new Transporter(this.context.coopRepo, this.context.data, this.page, this.shapes);
        this.isTransApi = true;
        const t = this.asyncApiCaller as Transporter;
        t.setEnv(record_origin_env(this.shapes));
        const except_envs = find_except_envs(this.context, this.shapes, this.fixedPoint);
        t.setExceptEnvs(except_envs);
        t.setCurrentEnv(except_envs[0] as any);
    }

    get transApi() {
        return this.isTransApi;
    }
    fulfil() {
        super.fulfil();
    }

    executePadding(padding: number, direction: PaddingDir, padding2 = 0) {
        if (this.shapes.length !== 1) return;
        const shape = this.shapes[0];
        if (!(shape instanceof GroupShapeView)) return;
        if (direction === 'hor') {
            (this.asyncApiCaller as AutoLayoutModify).executeHorPadding(shape, padding, padding2);
        } else if (direction === 'ver') {
            (this.asyncApiCaller as AutoLayoutModify).executeVerPadding(shape, padding, padding2);
        } else {
            (this.asyncApiCaller as AutoLayoutModify).executePadding(shape, padding, direction);
        }
    }

    executeSpace(space: number, direction: PaddingDir) {
        if (this.shapes.length !== 1) return;
        const shape = this.shapes[0] as ArtboradView;
        if (!(shape instanceof GroupShapeView)) return;
        (this.asyncApiCaller as AutoLayoutModify).executeSpace(shape, space, direction);
    }

    executeSwap(shape: ShapeView, target: ShapeView[], x: number, y: number) {
        if (!(shape instanceof GroupShapeView)) return;
        (this.asyncApiCaller as AutoLayoutModify).swapShapeLayout(shape, target, x, y);
    }

    private __migrate(targetXY: PageXY, tailCollect = true) {
        const t = this.asyncApiCaller as Transporter;
        if (!t) {
            return;
        }

        const ctx = this.context;

        const target_parent = ctx.selection.getEnvForMigrate(targetXY);

        if (target_parent.id === t.current_env_id) {
            return;
        }

        const except = t.getExceptEnvs();

        const o_env = except.find(v => v.id === target_parent.id);

        if (o_env) {
            t.backToStartEnv(o_env.data, ctx.workspace.t('compos.dlt'));
        } else {
            const tp = adapt2Shape(target_parent) as GroupShape;
            const _shapes = compare_layer_3(this.shapes, -1).map((s) => adapt2Shape(s));
            t.migrate(tp, _shapes, ctx.workspace.t('compos.dlt'));
        }

        ctx.nextTick(ctx.selection.selectedPage!, () => {
            ctx.tool.notify(Tool.RULE_RENDER);

            if (tailCollect) {
                ctx.assist.set_collect_target(this.shapes, true);
            }
        })
    }

    migrateOnce = debounce(this.__migrate, 160);

    migrate(XY: PageXY) {
        this.migrateOnce(XY);
    }

}