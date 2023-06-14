import { Color, Fill, Shape, FillColorAction, FillEnableAction, FillAddAction, FillDeleteAction, FillsReplaceAction } from "@kcdesign/data";
interface FillItem {
    id: number,
    fill: Fill
}
export function get_fills(shapes: Shape[]): FillItem[] | 'mixed' {
    const fills: FillItem[] = [];
    const shape = shapes[0];
    const style = shape.style;
    const compare_str: string[] = [];
    for (let i = 0, len = style.fills.length; i < len; i++) {
        const fill = style.fills[i];
        const f = { id: i, fill };
        fills.push(f);
        const str = [fill.isEnabled, fill.color.red, fill.color.green, fill.color.blue, fill.color.blue].join('-');
        compare_str.push(str);
    }
    for (let i = 1; i < shapes.length; i++) {
        const shape = shapes[i];
        const len = shape.style.fills.length;
        if (len !== fills.length) return 'mixed';
        const s_fs = shape.style.fills;
        for (let j = 0; j < len; j++) {
            const fill = s_fs[j];
            const str = [fill.isEnabled, fill.color.red, fill.color.green, fill.color.blue, fill.color.blue].join('-');
            if (str !== compare_str[j]) return 'mixed';
        }
    }
    return fills;
}
export function get_actions_add_fill(shapes: Shape[], fill: Fill) {
    const actions: FillAddAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        actions.push({ target: shapes[i], value: fill });
    }
    return actions;
}
export function get_actions_fill_color(shapes: Shape[], index: number, color: Color) {
    const actions: FillColorAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        actions.push({ target: shapes[i], index, value: color });
    }
    return actions;
}
export function get_actions_fill_unify(shapes: Shape[]) {
    const actions: FillsReplaceAction[] = [];
    const fills = shapes[0].style.fills;
    for (let i = 1; i < shapes.length; i++) {
        actions.push({ target: shapes[i], value: fills });
    }
    return actions;
}
export function get_actions_fill_enabled(shapes: Shape[], index: number, value: boolean) {
    const actions: FillEnableAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        actions.push({ target: shapes[i], index, value });
    }
    return actions;
}
export function get_actions_fill_delete(shapes: Shape[], index: number) {
    const actions: FillDeleteAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        actions.push({ target: shapes[i], index });
    }
    return actions;
}