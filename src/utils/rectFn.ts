import { CtrlElementType } from "@/context/workspace";

export function getBarStyle(ct: CtrlElementType, width: number, height: number) {
    const offset = 8;
    let style: string = '';
    if (ct === CtrlElementType.RectTop) {
        style = `top: ${-offset}px; width: ${width}px;`;
    } else if (ct ===CtrlElementType.RectRight) {
        style = `top: ${-offset}px; width: ${height}px; transform: translateX(${width}px) rotate(90deg);`;
    } else if (ct ===CtrlElementType.RectBottom) {
        style = `bottom: ${-offset}px; width: ${width}px;`;
    } else if (ct ===CtrlElementType.RectLeft) {
        style = `top: ${-offset}px; width: ${height}px; transform: rotate(90deg);`;
    }    
    return style;
}