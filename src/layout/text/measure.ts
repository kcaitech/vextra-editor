// https://zhuanlan.zhihu.com/p/338634062
const canvas2D = (() => {
    let canvas: CanvasRenderingContext2D | null;
    return () => {
        return canvas || (canvas = document.createElement("canvas").getContext("2d"));
    }
})();

function measureText(text: string, font: string): TextMetrics | undefined {
    // re-use canvas object for better performance
    const context: CanvasRenderingContext2D | null = canvas2D();
    if (context) {
        context.font = font;
        const metrics:TextMetrics = context.measureText(text);
        return metrics;
    }
    return undefined;
}

// 等宽字符集
function isEqualWidthCode(code: number): boolean {
    return code >= 0x4E00 && code <= 0x9FA5 // 基本汉字	20902字
        || code >= 0x2E80 && code <= 0xA4CF
        || code >= 0xF900 && code <= 0xFAFF
        || code >= 0xFE30 && code <= 0xFE4F;
}

function isAsciiCode(code: number) {
    return code <= 0xff && code >= 0;
}

// measure equal width code cache
const _mEWCCache: { [key: string]: TextMetrics | undefined } = {};
const _mAsciiCache: { [key: string]: { [key: string]: TextMetrics | undefined } } = {};

export function measure(code: number, font: string) {
    if (isAsciiCode(code)) {
        let cache: { [key: string]: TextMetrics | undefined } = _mAsciiCache[font];
        if (!cache) {
            cache = {}
            _mAsciiCache[font] = cache;
        }
        let m = cache[code];
        if (!m) {
            m = measureText(String.fromCharCode(code), font);
            cache[code] = m;
        }
        return m;
    }
    if (isEqualWidthCode(code)) {
        let m: TextMetrics | undefined = _mEWCCache[font];
        if (!m) {
            m = measureText(String.fromCharCode(code), font);
            _mEWCCache[font] = m;
        }
        return m;
    }
    return measureText(String.fromCharCode(code), font);
}