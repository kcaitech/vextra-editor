import { Path2D } from "skia-canvas";
export async function init() {
}

export function difference(path0: string, path1: string): string {
    const p0: Path2D = new Path2D(path0);
    const p1: Path2D = new Path2D(path1);
    const result = p0.xor(p1);
    // console.log("difference", result);
    return result.d;
}
export function intersection(path0: string, path1: string): string {
    const p0: Path2D = new Path2D(path0);
    const p1: Path2D = new Path2D(path1);
    const result = p0.intersect(p1);
    // console.log("intersect", result);
    return result.d;
}
export function subtract(path0: string, path1: string): string {
    const p0: Path2D = new Path2D(path0);
    const p1: Path2D = new Path2D(path1);
    const result = p0.difference(p1);
    // console.log("difference", result);
    return result.d;
}
export function union(path0: string, path1: string): string {
    const p0: Path2D = new Path2D(path0);
    const p1: Path2D = new Path2D(path1);
    const result = p0.union(p1);
    // console.log("union", result);
    return result.d;
}