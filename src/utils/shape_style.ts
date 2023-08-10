import {
    Color, Fill, Shape, FillColorAction, FillEnableAction, FillAddAction, FillDeleteAction, FillsReplaceAction,
    Border, BorderColorAction, BorderEnableAction, BorderAddAction, BorderDeleteAction, BordersReplaceAction, BorderThicknessAction, BorderPositionAction, BorderStyleAction, BorderPosition, BorderStyle
} from "@kcdesign/data";
import { v4 } from "uuid";
interface FillItem {
    id: number,
    fill: Fill
}
interface BorderItem {
    id: number,
    border: Border
}
// fills
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
        const new_fills: Fill[] = [];
        for (let i = 0; i < fills.length; i++) {
            const fill = fills[i];
            const { isEnabled, fillType, color, contextSettings } = fill;
            const new_fill = new Fill(v4(), isEnabled, fillType, color);
            new_fill.contextSettings = contextSettings;
            new_fills.push(new_fill);
        }
        actions.push({ target: shapes[i], value: new_fills });
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

// borders
export function get_borders(shapes: Shape[]): BorderItem[] | 'mixed' {
    const borders: BorderItem[] = [];
    const shape = shapes[0];
    const style = shape.style;
    const compare_str: string[] = [];
    for (let i = 0, len = style.borders.length; i < len; i++) {
        const border = style.borders[i];
        const b = { id: i, border };
        borders.push(b);
        const str = [
            border.isEnabled,
            border.color.red,
            border.color.green,
            border.color.blue,
            border.color.blue,
            border.borderStyle.gap,
            border.borderStyle.length,
            border.endMarkerType,
            border.startMarkerType,
            border.thickness,
            border.position
        ].join('-');
        compare_str.push(str);
    }
    for (let i = 1; i < shapes.length; i++) {
        const shape = shapes[i];
        const len = shape.style.borders.length;
        if (len !== borders.length) return 'mixed';
        const s_bs = shape.style.borders;
        for (let j = 0; j < len; j++) {
            const border = s_bs[j];
            const str = [
                border.isEnabled,
                border.color.red,
                border.color.green,
                border.color.blue,
                border.color.blue,
                border.borderStyle.gap,
                border.borderStyle.length,
                border.endMarkerType,
                border.startMarkerType,
                border.thickness,
                border.position
            ].join('-');
            if (str !== compare_str[j]) return 'mixed';
        }
    }
    return borders;
}
export function get_actions_add_boder(shapes: Shape[], border: Border) {
    const actions: BorderAddAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const { isEnabled, fillType, color, contextSettings, position, thickness, borderStyle, startMarkerType, endMarkerType } = border;
        const new_border = new Border(v4(), isEnabled, fillType, color, position, thickness, borderStyle, startMarkerType, endMarkerType);
        new_border.contextSettings = contextSettings;
        actions.push({ target: shapes[i], value: new_border });
    }
    return actions;
}
export function get_actions_border_color(shapes: Shape[], index: number, color: Color) {
    const actions: BorderColorAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        actions.push({ target: shapes[i], index, value: color });
    }
    return actions;
}
export function get_actions_border_unify(shapes: Shape[]) {
    const actions: BordersReplaceAction[] = [];
    const borders = shapes[0].style.borders;
    for (let i = 1; i < shapes.length; i++) {
        const new_borders: Border[] = [];
        for (let i = 0; i < borders.length; i++) {
            const border = borders[i];
            const { isEnabled, fillType, color, contextSettings, position, thickness, borderStyle, startMarkerType, endMarkerType } = border;
            const new_border = new Border(v4(), isEnabled, fillType, color, position, thickness, borderStyle, startMarkerType, endMarkerType);
            new_border.contextSettings = contextSettings;
            new_borders.push(new_border);
        }
        actions.push({ target: shapes[i], value: new_borders });
    }
    return actions;
}
export function get_actions_border_enabled(shapes: Shape[], index: number, value: boolean) {
    const actions: BorderEnableAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        actions.push({ target: shapes[i], index, value });
    }
    return actions;
}
export function get_actions_border_delete(shapes: Shape[], index: number) {
    const actions: BorderDeleteAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        actions.push({ target: shapes[i], index });
    }
    return actions;
}
export function get_actions_border_thickness(shapes: Shape[], index: number, thickness: number) {
    const actions: BorderThicknessAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        actions.push({ target: shapes[i], index, value: thickness });
    }
    return actions;
}
export function get_actions_border_position(shapes: Shape[], index: number, position: BorderPosition) {
    const actions: BorderPositionAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        actions.push({ target: shapes[i], index, value: position });
    }
    return actions;
}
export function get_actions_border_style(shapes: Shape[], index: number, style: 'dash' | 'solid') {
    const actions: BorderStyleAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const bs = new BorderStyle(0, 0);
        if (style === 'dash') {
            bs.gap = 10, bs.length = 10;
        }
        actions.push({ target: shapes[i], index, value: bs });
    }
    return actions;
}