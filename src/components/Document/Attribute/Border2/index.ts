import {
    BorderSideSetting,
    ShapeType,
    SideType
} from "@kcdesign/data";

export const customizable = [
    ShapeType.Rectangle,
    ShapeType.Artboard,
    ShapeType.Image,
    ShapeType.Symbol,
    ShapeType.SymbolRef,
    ShapeType.SymbolUnion
];
export const getSideThickness = (side: BorderSideSetting): number | false => {
    const { sideType, thicknessBottom, thicknessLeft, thicknessRight, thicknessTop } = side;
    return (() => {
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
}
