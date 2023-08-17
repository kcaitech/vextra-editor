import { Potrace } from "./potrace";

const __caches: Map<string, string> = new Map();
let __canvasElement: HTMLCanvasElement | undefined;

export function getTextPath(font: string, fontSize: number, charCode: number): string {
    const scale = 16;
    fontSize = Math.round(fontSize * scale);
    const cacheId = font + "#" + fontSize + "#" + charCode;
    let path = __caches.get(cacheId);
    if (path) return path;

    if (!__canvasElement) {
        __canvasElement = document.createElement('canvas');
    }
    const canvasElement: HTMLCanvasElement = __canvasElement;
    const width = fontSize;
    const height = Math.round(fontSize * 1.1); // 有字符如：g，底部被截断
    canvasElement.width = width;
    canvasElement.height = height;
    const canvas = canvasElement.getContext('2d')!
    canvas.imageSmoothingEnabled = false;

    canvas.font = '' + fontSize + 'px ' + font;
    canvas.fillStyle = 'black'
    canvas.textAlign = 'left'
    canvas.textBaseline = 'top'
    canvas.fillText(String.fromCharCode(charCode), 0, 0)

    const imgdata: ImageData = canvas.getImageData(0, 0, width, height)
    const potrace = new Potrace(imgdata, () => { })
    path = potrace.getSVGPath({x: 1 / scale, y: 1 / scale});
    __caches.set(cacheId, path);

    return path;
}
