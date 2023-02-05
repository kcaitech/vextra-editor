import CanvasKitInit, { CanvasKit, Path } from "canvaskit-wasm";

let _ck: CanvasKit | undefined;
export async function init() {
    if (_ck) return;
    _ck = await CanvasKitInit({
        locateFile: (file) => '/wasm/' + file,
    })
}

export function difference(path0: string, path1: string): string {
    if (!_ck) throw Error("Not init");
    const p0: Path | null = _ck.Path.MakeFromSVGString(path0);
    const p1: Path | null = _ck.Path.MakeFromSVGString(path1);
    if (p0 && p1) {
        p0.op(p1, _ck.PathOp.XOR)
        const path = p0.toSVGString();
        p0.delete();
        p1.delete();
        return path;
    }
    console.log("difference op failed")
    return "";
}
export function intersection(path0: string, path1: string): string {
    if (!_ck) throw Error("Not init");
    const p0: Path | null = _ck.Path.MakeFromSVGString(path0);
    const p1: Path | null = _ck.Path.MakeFromSVGString(path1);
    if (p0 && p1) {
        p0.op(p1, _ck.PathOp.Intersect)
        const path = p0.toSVGString();
        p0.delete();
        p1.delete();
        return path;
    }
    console.log("intersect op failed")
    return "";
}
export function subtract(path0: string, path1: string): string {
    if (!_ck) throw Error("Not init");
    const p0: Path | null = _ck.Path.MakeFromSVGString(path0);
    const p1: Path | null = _ck.Path.MakeFromSVGString(path1);
    if (p0 && p1) {
        p0.op(p1, _ck.PathOp.Difference)
        const path = p0.toSVGString();
        p0.delete();
        p1.delete();
        return path;
    }
    console.log("subtract op failed")
    return "";
}
export function union(path0: string, path1: string): string {
    if (!_ck) throw Error("Not init");
    const p0: Path | null = _ck.Path.MakeFromSVGString(path0);
    const p1: Path | null = _ck.Path.MakeFromSVGString(path1);
    if (p0 && p1) {
        p0.op(p1, _ck.PathOp.Union)
        const path = p0.toSVGString();
        p0.delete();
        p1.delete();
        return path;
    }
    console.log("union op failed")
    return "";
}