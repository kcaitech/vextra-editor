import { Context } from "@/context";
import { PathShapeView, ShapeView } from "@kcdesign/data";

export interface OvalOptions {
    start: number | string;
    sweep: number | string;
    ratio: number | string;
}

export function sortValue(value: string) {
    let __value: number | string = Number(value.replace(/[°|%]/g, ''));
    __value = Number(__value.toFixed(2));
    if (isNaN(__value)) return __value;
    if (!(__value * 100 % 10)) __value = Number(__value.toFixed(1));
    return __value;
}


export class OvalData {
    static MIXED = 'mixed';

    private readonly m_options: OvalOptions;
    private readonly m_context: Context;

    private m_selected: ShapeView[];

    constructor(context: Context, options: OvalOptions) {
        this.m_context = context;
        this.m_options = options;
        this.m_selected = context.selection.selectedShapes;
    }

    stashSelection(selected?: ShapeView[]) {
        this.m_selected = [...(selected || this.m_context.selection.selectedShapes)];
    }

    update(trigger: any[]) {
        console.log('--trigger--', trigger);
    }

    __update() {
        const selected = this.m_selected;
        let START = new Set<number | undefined>();
        let END = new Set<number | undefined>();
        let RATIO = new Set<number | undefined>();
        for (const oval of selected) {
            if (!(oval instanceof PathShapeView) || oval.haveEdit) continue;
            const start = oval.startingAngle ?? 0;
            const end = oval.endingAngle ?? Math.PI * 2;
            const ratio = oval.innerRadius ?? 0;
            START.add(start);
            END.add(end);
            RATIO.add(ratio);
        }
        const options = this.m_options;
        let __start;
        if (START.size > 1) {
            __start = OvalData.MIXED;
        } else {
            __start = Array.from(START.values()).pop() || 0;
        }

        if (END.size > 1 || typeof __start === "string") {
            options.sweep = OvalData.MIXED;
        } else {
            let __end = Array.from(END.values()).pop() || 0;
            options.sweep = 100 * (__end - __start) / (Math.PI * 2);
        }

        if (typeof __start === "string") {
            options.start = OvalData.MIXED;
        } else {
            __start = 360 * (__start / (Math.PI * 2));
            if (__start > 180) __start -= 360;
            options.start = __start;
        }


        if (RATIO.size > 1) {
            options.ratio = OvalData.MIXED;
        } else {
            options.ratio = (Array.from(RATIO.values()).pop() || 0) * 100;
        }
    }

    getPath() {
        let { start, sweep, ratio } = this.m_options;
        if (typeof start === "string" || typeof sweep === "string" || typeof ratio === "string") {
            // 分别给path

        } else {
            // 统一的path
        }
    }
}