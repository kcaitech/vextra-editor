import { Context } from "@/context";
import { ShapeView } from "@kcdesign/data";

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
    private m_context: Context;
    private m_options: OvalOptions;
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
}