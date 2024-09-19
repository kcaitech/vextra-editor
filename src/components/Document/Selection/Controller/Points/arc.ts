import { AsyncApiCaller, PathShapeView, OvalModifier, Matrix } from "@kcdesign/data";
import { Context } from '@/context';

export interface Dot {
    visible: boolean;
    x: number;
    y: number;
}

export interface Active {
    key: string;
    value: string;
}

export enum ArcKey {
    Start,
    End,
    InnerRadius
}

export class ArcFreeModifier {
    private readonly context: Context;
    private readonly m_oval: PathShapeView;
    private readonly m_key: ArcKey;
    private readonly m_start: Dot;
    private readonly m_end: Dot;
    private readonly m_radius: Dot;
    private readonly m_active: Active;

    asyncApiCaller: AsyncApiCaller | undefined;

    constructor(context: Context, oval: PathShapeView, key: ArcKey, start: Dot, end: Dot, radius: Dot, active: Active) {
        this.context = context;
        this.m_oval = oval;
        this.m_key = key;
        this.m_start = start;
        this.m_end = end;
        this.m_radius = radius;
        this.m_active = active;

        this.beforeTransform();
    }

    private beforeTransform() {
        this.context.menu.menuMount(); // 关闭已打开的弹窗
        this.context.cursor.cursor_freeze(true); // 禁用光标自动变换
        this.context.workspace.setCtrl('controller'); // 将编辑器控制权交给控件
    }

    createApiCaller() {
        if (this.context.readonly) return;
        this.asyncApiCaller = new OvalModifier(this.context.coopRepo, this.context.data, this.context.selection.selectedPage!);
    }

    modifyStart(event: MouseEvent) {
        const oval = this.m_oval;

        let xy = this.context.workspace.getContentXY(event);
        let matrix = new Matrix();
        matrix.scale(oval.frame.width, oval.frame.height);
        matrix.multiAtLeft(oval.matrix2Root());
        matrix.multiAtLeft(this.context.workspace.matrix);
        matrix = new Matrix(matrix.inverse);

        xy = matrix.computeCoord3(xy);

        let __start = Math.atan2(xy.y - 0.5, xy.x - 0.5);
        if (__start < 0) __start = Math.PI * 2 + __start;

        (this.asyncApiCaller as OvalModifier).modifyStart(__start, [oval]);
    }

    modifyEnd(event: MouseEvent) {
        const oval = this.m_oval;

        let xy = this.context.workspace.getContentXY(event);
        let matrix = new Matrix();
        matrix.scale(oval.frame.width, oval.frame.height);
        matrix.multiAtLeft(oval.matrix2Root());
        matrix.multiAtLeft(this.context.workspace.matrix);
        matrix = new Matrix(matrix.inverse);

        xy = matrix.computeCoord3(xy);

        let __end = Math.atan2(xy.y - 0.5, xy.x - 0.5);
        if (__end < 0) __end = Math.PI * 2 + __end;

        // (this.asyncApiCaller as OvalModifier).modifyEnd(__end, [oval]);
    }

    modifyRadius(event: MouseEvent) {

    }

    fulfil() {
        const context = this.context;

        this.asyncApiCaller?.commit();
        context.assist.reset();
        context.workspace.setCtrl('page');
        context.cursor.cursor_freeze(false);
    }

    updateCtrlView() {

    }
}