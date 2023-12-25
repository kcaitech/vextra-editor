import { XY } from "@/context/selection";

/**
 * @description 获取a点到b点的距离
 */
export function get_length(a: XY, b: XY) {
    return Math.hypot(b.x - a.x, b.y - a.y);
}
export function isEqu(a: number, b: number) {
    return Math.abs(a - b) < 0.0001;
}
export function dir(a: XY, b: XY): 'ver' | 'hor' | undefined {
    if (isEqu(a.x, b.x)) {
        return 'ver';
    }

    if (isEqu(a.y, b.y)) {
        return 'hor';
    }
}
export function get_locate(a: XY, b: XY) {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}