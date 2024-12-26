import {
    BasicArray,
    BatchAction,
    BatchAction2,
    Border,
    BorderSideSetting, PageView,
    Shape,
    ShapeType,
    ShapeView,
    SideType,
    SymbolRefView
} from "@kcdesign/data";

export const can_custom = [ShapeType.Rectangle, ShapeType.Artboard, ShapeType.Image, ShapeType.Symbol, ShapeType.SymbolRef, ShapeType.SymbolUnion];
export const getSideThickness = (side: BorderSideSetting, view?: ShapeView): number | false => {
    const { sideType, thicknessBottom, thicknessLeft, thicknessRight, thicknessTop } = side;
    let t = (() => {
        switch (sideType) {
            case SideType.Top:
                return thicknessTop;
            case SideType.Left:
                return thicknessLeft;
            case SideType.Right:
                return thicknessRight;
            case SideType.Bottom:
                return thicknessBottom;
            case SideType.Custom:
                if (thicknessBottom === thicknessLeft && thicknessLeft === thicknessRight && thicknessRight === thicknessTop) {
                    return thicknessTop;
                } else {
                    return false;
                }
            default:
                return thicknessTop;
        }
    })();

    // if (typeof t === "number" && view) {
    //     let parent: any = view;
    //     while (parent) {
    //         let scale = parent.scale;
    //         if (scale && scale !== 1) t *= scale;
    //         parent = parent.parent;
    //     }
    // }

    return t;
}


export const getSideInfo = (border: Border, type: SideType) => {
    const { thicknessBottom, thicknessTop, thicknessLeft, thicknessRight, sideType } = border.sideSetting;
    const max_thickness = Math.max(thicknessTop, thicknessLeft, thicknessBottom, thicknessRight)
    switch (type) {
        case SideType.Normal:
            return new BorderSideSetting(type, max_thickness, max_thickness, max_thickness, max_thickness);
        case SideType.Top:
            return new BorderSideSetting(type, thicknessTop === 0 ? max_thickness : thicknessTop, 0, 0, 0);
        case SideType.Left:
            return new BorderSideSetting(type, 0, thicknessLeft === 0 ? max_thickness : thicknessLeft, 0, 0);
        case SideType.Right:
            return new BorderSideSetting(type, 0, 0, 0, thicknessRight === 0 ? max_thickness : thicknessRight);
        case SideType.Bottom:
            return new BorderSideSetting(type, 0, 0, thicknessBottom === 0 ? max_thickness : thicknessBottom, 0);
        case SideType.Custom:
            switch (sideType) {
                case SideType.Top:
                    return new BorderSideSetting(type, thicknessTop, 0, 0, 0);
                case SideType.Left:
                    return new BorderSideSetting(type, 0, thicknessLeft, 0, 0);
                case SideType.Right:
                    return new BorderSideSetting(type, 0, 0, 0, thicknessRight);
                case SideType.Bottom:
                    return new BorderSideSetting(type, 0, 0, thicknessBottom, 0);
                case SideType.Normal:
                    return new BorderSideSetting(type, thicknessTop, thicknessLeft, thicknessBottom, thicknessRight);
                default:
                    return new BorderSideSetting(type, 0, 0, 0, 0);
            }
        default:
            return new BorderSideSetting(SideType.Normal, 0, 0, 0, 0);
    }
}

export function get_actions_border_side_info(shapes: ShapeView[], info: BorderSideSetting) {
    const actions: BatchAction2[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        const { sideType, thicknessBottom, thicknessLeft, thicknessRight, thicknessTop } = info;
        const data = new BorderSideSetting(sideType, thicknessTop, thicknessLeft, thicknessBottom, thicknessRight);
        actions.push({ target: (shapes[i]), value: data });
    }
    return actions;
}

export function get_borders_side_thickness(shapes: ShapeView[]) {
    const styleborders = shapes[0].getBorders();
    const b = styleborders.sideSetting;
    let side: (number | false)[] = [b.thicknessTop, b.thicknessRight, b.thicknessBottom, b.thicknessLeft];
    for (let i = 1; i < shapes.length; i++) {
        const borders = shapes[i].getBorders() || [];
        const { thicknessTop, thicknessRight, thicknessBottom, thicknessLeft } = borders.sideSetting;
        if (b.thicknessTop !== thicknessTop) side[0] = false;
        if (b.thicknessRight !== thicknessRight) side[1] = false;
        if (b.thicknessBottom !== thicknessBottom) side[2] = false;
        if (b.thicknessLeft !== thicknessLeft) side[3] = false;
    }
    return side;
}