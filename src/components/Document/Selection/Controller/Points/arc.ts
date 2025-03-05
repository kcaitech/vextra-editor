import { AsyncApiCaller, PathShapeView, OvalModifier, Matrix, Transform } from "@kcdesign/data";
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
        let matrix = new Transform();
        matrix.scale(oval.frame.width, oval.frame.height);
        matrix.multiAtLeft(oval.matrix2Root());
        matrix.multiAtLeft(this.context.workspace.matrix);
        matrix = (matrix.inverse);

        xy = matrix.computeCoord3(xy);

        const round = Math.PI * 2;
        const quarter = Math.PI / 4;
        let __start = Math.atan2(xy.y - 0.5, xy.x - 0.5);
        if (__start < 0) __start = round + __start;

        const __lip = round / 360 * 5;
        const __slice = __start % quarter;

        if (__slice < __lip) __start -= __slice;
        else if (__slice > quarter - __lip) __start = __start - __slice + quarter;

        __start %= round;

        (this.asyncApiCaller as OvalModifier).modifyStart(__start, [oval]);
    }

    private __last: number | undefined;
    private __target: 0 | 1 = 1; // 0 是逆时针，1 是顺时针
    private __base_sweep: number | undefined;

    private get baseSweep() {
        if (this.__base_sweep === undefined) {
            const round = Math.PI * 2;
            const oval = this.m_oval;
            const end = oval.endingAngle ?? round;
            const start = oval.startingAngle ?? 0;
            this.__base_sweep = (end - start) / round;
        }
        return this.__base_sweep;
    }

    private get currentSweep() {
        const round = Math.PI * 2;
        const oval = this.m_oval;
        const end = oval.endingAngle ?? round;
        const start = oval.startingAngle ?? 0;
        return (end - start) / round
    }

    private __update_target(rad: number) {
        const round = Math.PI * 2;
        let last = this.__last;
        if (last === undefined) {
            const sweep = this.baseSweep;
            if (sweep === 1) {
                if (rad > round * 0.75) {
                    this.__target = 1;
                } else {
                    this.__target = 0;
                }
            } else if (sweep === 0) {
                if (rad > round * 0.75) {
                    this.__target = 0;
                } else {
                    this.__target = 1;
                }
            } else {
                this.__target = sweep < 0 ? 0 : 1;
            }
        } else {
            if ((0 <= rad && rad < Math.PI / 2) && (Math.PI * 1.5 < last && last <= Math.PI * 2)) {
                const currentSweep = this.currentSweep;
                this.__target = currentSweep > 0.5 ? 0 : 1;
            } else if ((0 <= last && last < Math.PI / 2) && (Math.PI * 1.5 < rad && rad <= Math.PI * 2)) {
                const currentSweep = Math.abs(this.currentSweep);
                this.__target = currentSweep > 0.5 ? 1 : 0;
            }
        }

        this.__last = rad;
    }

    private __radian_of_target(rad: number) {
        return this.__target ? rad : rad - Math.PI * 2;
    }

    modifyEnd(event: MouseEvent) {
        const round = Math.PI * 2;
        const oval = this.m_oval;
        const start = oval.startingAngle ?? 0;
        let xy = this.context.workspace.getContentXY(event);

        let matrix = new Transform();
        start && matrix.rotate(start, 0.5, 0.5);
        matrix.scale(oval.frame.width, oval.frame.height);
        matrix.multiAtLeft(oval.matrix2Root());
        matrix.multiAtLeft(this.context.workspace.matrix);
        matrix = (matrix.inverse);
        xy = matrix.computeCoord3(xy);

        let __end = Math.atan2(xy.y - 0.5, xy.x - 0.5);
        if (__end < 0) __end = round + __end;
        if (__end === 0) __end = round;

        const quarter = Math.PI / 4;
        const __lip = round / 360 * 5;
        const __slice = __end % quarter;
        if (__slice < __lip) __end -= __slice;
        else if (__slice > quarter - __lip) __end = __end - __slice + quarter;

        this.__update_target(__end);
        __end = this.__radian_of_target(__end);

        (this.asyncApiCaller as OvalModifier).modifyEnd(__end + start, [oval]);
    }

    modifyRadius(event: MouseEvent) {
        const round = Math.PI * 2;
        const oval = this.m_oval;

        const start = oval.startingAngle ?? 0;
        let xy = this.context.workspace.getContentXY(event);

        let matrix = new Transform();
        start && matrix.rotate(start, 0.5, 0.5);
        matrix.scale(oval.frame.width, oval.frame.height);
        matrix.multiAtLeft(oval.matrix2Root());
        matrix.multiAtLeft(this.context.workspace.matrix);
        matrix = (matrix.inverse);
        xy = matrix.computeCoord3(xy);

        let __end = Math.atan2(xy.y - 0.5, xy.x - 0.5);
        if (__end < 0) __end = round + __end;
        if (__end === 0) __end = round;

        const sweep = this.currentSweep;
        const end = (this.m_oval.endingAngle ?? round) - start;

        let needSwap: boolean;
        if (sweep < 0) {
            needSwap = __end < end + round;
        } else if (sweep > 0) {
            needSwap = __end > end;
        } else {
            needSwap = __end !== 0;
        }

        if (needSwap) (this.asyncApiCaller as OvalModifier).swapGap(oval);

        let innerRadius = Math.min(Math.hypot(xy.x - 0.5, xy.y - 0.5) / 0.5, 1);
        if (innerRadius < 0.05) innerRadius = 0;
        (this.asyncApiCaller as OvalModifier).modifyRadius(innerRadius, [oval]);
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