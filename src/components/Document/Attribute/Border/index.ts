import { Border, BorderSideSetting, SideType } from "@kcdesign/data";

export const getSideThickness = (side: BorderSideSetting): number | false => {
    const { sideType, thicknessBottom, thicknessLeft, thicknessRight, thicknessTop } = side;
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