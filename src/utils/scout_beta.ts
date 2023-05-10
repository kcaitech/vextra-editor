import { PageXY } from "@/context/selection";
import CanvasKitInit, { Path } from "@kcdesign/canvaskit-wasm";

// 蜘蛛侦探🕷 ver.canvaskit-wasm，基于canvaskit-wasm实现的图形检索
interface CanvasKitScout {
    isPointInShape: (d: string, point: PageXY) => boolean;
}
async function loadCanvasKit() {
    const init = await CanvasKitInit({
        locateFile: (file: string) =>
            `/${file}`
    });
    return init;
}

async function canvasKitScout(): Promise<CanvasKitScout> {
    const init = await loadCanvasKit();

    function isPointInShape(d: string, point: PageXY): boolean {
        const path: Path | null = init.Path.MakeFromSVGString(d);
        if (path) {
            const { x, y } = point;
            const isContains = path.contains(x, y);
            path.delete();
            return isContains;
        } else {
            return false;
        }
    }
    return { isPointInShape };
}

export { canvasKitScout, CanvasKitScout }