import { TextShape } from "@kcdesign/data";
import { Color } from "@kcdesign/data";
import { getTextPath } from "@/textpath";
import { Path } from "@kcdesign/data";

function toRGBA(color: Color): string {
    return "rgba(" + color.red + "," + color.green + "," + color.blue + "," + color.alpha + ")";
}

function isBlankChar(charCode: number) {
    switch (charCode) {
        case 0x09: // '\t'
        case 0x0a: // '\n'
        case 0x20: // ' '
            return true;
    }
    return false;
}

export function renderText2Path(shape: TextShape, offsetX: number, offsetY: number): string {
    const { yOffset, paras } = shape.getLayout();
    const pc = paras.length;

    const paths = [];
    for (let i = 0; i < pc; i++) {
        const lines = paras[i];

        for (let lineIndex = 0, lineCount = lines.length; lineIndex < lineCount; lineIndex++) {
            const line = lines[lineIndex];

            for (let garrIdx = 0, garrCount = line.length; garrIdx < garrCount; garrIdx++) {
                const garr = line[garrIdx];
                const span = garr.attr;
                const font = span?.fontName || '';
                const fontSize = span?.fontSize || 0;
                const y = lines.yOffset + line.y + (line.lineHeight - fontSize) / 2 + yOffset; // top

                paths.push(...garr.map((g) => {
                    if (isBlankChar(g.char.charCodeAt(0))) return '';
                    const pathstr = getTextPath(font, fontSize, g.char.charCodeAt(0))
                    const path = new Path(pathstr)
                    path.translate(g.x + offsetX, y + offsetY);
                    return path.toString();
                }))
            }
        }
    }
    return paths.join('');
}

export function render(h: Function, shape: TextShape, reflush?: number) {
    const { yOffset, paras } = shape.getLayout();
    const pc = paras.length;

    const childs = []
    for (let i = 0; i < pc; i++) {
        const lines = paras[i];

        for (let lineIndex = 0, lineCount = lines.length; lineIndex < lineCount; lineIndex++) {
            const line = lines[lineIndex];
            // const y = line.y + line.lineHeight / 2 + yOffset;

            for (let garrIdx = 0, garrCount = line.length; garrIdx < garrCount; garrIdx++) {
                const gText = []
                const gX = []
                // const gY = []
                const garr = line[garrIdx];
                for (let gIdx = 0, gCount = garr.length; gIdx < gCount; gIdx++) {
                    const graph = garr[gIdx];
                    if (isBlankChar(graph.char.charCodeAt(0))) { // 两个连续的空格或者首个空格，svg显示有问题
                        continue;
                    }
                    gText.push(graph.char);
                    gX.push(graph.x);
                }

                const span = garr.attr;
                const fontSize = span?.fontSize || 0;
                const fontName = span?.fontName;
                const y = lines.yOffset + line.y + (line.lineHeight) / 2 + yOffset; // top

                const font = "normal " + fontSize + "px " + fontName;
                const style: any = {
                    font,
                    'alignment-baseline': 'central'
                }
                if (span) {
                    if (span.color) style['fill'] = toRGBA(span.color);
                    if (span.bold) style['font-weight'] = "bold";
                    if (span.italic) style['font-style'] = "italic";
                }

                childs.push(h('text', { x: gX.join(' '), y, style: { fill: span && span.color && toRGBA(span.color), font, 'alignment-baseline': 'central' } }, gText.join('')));
            }
        }
    }

    const frame = shape.frame;
    const props: any = {}
    if (reflush) props.reflush = reflush;

    if (shape.isFlippedHorizontal || shape.isFlippedVertical || shape.rotation) {
        const cx = frame.x + frame.width / 2;
        const cy = frame.y + frame.height / 2;
        const style: any = {}
        style.transform = "translate(" + cx + "px," + cy + "px) "
        if (shape.isFlippedHorizontal) style.transform += "rotateY(180deg) "
        if (shape.isFlippedVertical) style.transform += "rotateX(180deg) "
        if (shape.rotation) style.transform += "rotate(" + shape.rotation + "deg) "
        style.transform += "translate(" + (-cx + frame.x) + "px," + (-cy + frame.y) + "px)"
        props.style = style;
    }
    else {
        props.transform = `translate(${frame.x},${frame.y})`
    }

    return h('g', props, childs);
}


//
// for test text path
export function render_(h: Function, shape: TextShape, reflush?: number) {
    const path = renderText2Path(shape, 0, 0);

    const childs = [h('path', { d: path })]

    const frame = shape.frame;
    const props: any = {}
    if (reflush) props.reflush = reflush;

    if (shape.isFlippedHorizontal || shape.isFlippedVertical || shape.rotation) {
        const cx = frame.x + frame.width / 2;
        const cy = frame.y + frame.height / 2;
        const style: any = {}
        style.transform = "translate(" + cx + "px," + cy + "px) "
        if (shape.isFlippedHorizontal) style.transform += "rotateY(180deg) "
        if (shape.isFlippedVertical) style.transform += "rotateX(180deg) "
        if (shape.rotation) style.transform += "rotate(" + shape.rotation + "deg) "
        style.transform += "translate(" + (-cx + frame.x) + "px," + (-cy + frame.y) + "px)"
        props.style = style;
    }
    else {
        props.transform = `translate(${frame.x},${frame.y})`
    }

    return h('g', props, childs);
}