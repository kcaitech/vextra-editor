import { Context } from "@/context";
import { PathShapeView, ShapeView } from "@kcdesign/data";

export interface OvalOptions {
    start: number | string;
    sweep: number | string;
    ratio: number | string;
}

export function sortValue(value: string) {
    return Number(value.replace(/[°|%]/g, ''));
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
        if (trigger.includes('pathsegs')) this.__update();
    }

    fix(value: number) {
        value = Number(value.toFixed(2));
        if (!(value * 100 % 10)) value = Number(value.toFixed(1));
        return value;
    }

    __update() {
        const selected = this.m_selected;

        let START = new Set<number | undefined>();
        let SWEEP = new Set<number | undefined>();
        let RATIO = new Set<number | undefined>();

        const round = Math.PI * 2;

        const fix = this.fix.bind(this);

        for (const oval of selected) {
            if (!(oval instanceof PathShapeView) || oval.haveEdit) continue;

            const start = oval.startingAngle ?? 0;
            const end = oval.endingAngle ?? round;
            const ratio = oval.innerRadius ?? 0;

            const sweep = (end - start) / round;

            START.add(start);
            SWEEP.add(sweep);
            RATIO.add(ratio);
        }

        const options = this.m_options;
        let __start;
        if (START.size > 1) {
            __start = OvalData.MIXED;
        } else {
            __start = Array.from(START.values()).pop() || 0;
        }

        if (SWEEP.size > 1) {
            options.sweep = OvalData.MIXED;
        } else {
            options.sweep = fix((Array.from(SWEEP.values()).pop() || 0) * 100);
        }

        if (typeof __start === "string") {
            options.start = OvalData.MIXED;
        } else {
            __start = 360 * (__start / (Math.PI * 2));
            if (__start > 180) __start -= 360;
            options.start = fix(__start);
        }

        if (RATIO.size > 1) {
            options.ratio = OvalData.MIXED;
        } else {
            options.ratio = fix((Array.from(RATIO.values()).pop() || 0) * 100);
        }
    }
}