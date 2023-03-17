import { Para, SpanAttr, TextHorAlign, TextVerAlign } from "@/data/data/text";
import { measure } from "./measure";

export interface IGraphy {
    char: string,
    metrics: TextMetrics | undefined,
    cw: number,
    index: number,
    x: number
}

export class GraphArray extends Array<IGraphy> {
    public attr: SpanAttr | undefined;
}
export class Line extends Array<GraphArray> {
    public maxFontSize: number = 0;
}
export type LineArray = Array<Line>

export function adjustLines(lineArray: LineArray, align: TextHorAlign) {
    // TODO
}

export function adjustLinesVertical(lines: LineArray, align: TextVerAlign) {

}

export function layoutPara(para: Para, width: number): LineArray {
    const spansCount = para.spans.length;
    if (spansCount === 0) {
        return [];
    }
    // const frame = shape.frame;
    // const width = frame.width;
    const charSpace = para.attr?.kerning ?? 0;

    const text = para.text;
    let textIdx = 0
    const textLen = text.length

    let spanIdx = 0, spanOffset = 0
    let span = para.spans[spanIdx];
    let font = "normal " + span.fontSize + "px " + span.fontName;

    const startX = 0, endX = startX + width;
    let curX = 0

    let graphArray: GraphArray | undefined;
    let line: Line = new Line();
    line.maxFontSize = span.fontSize ?? 0;
    const lineArray: LineArray = []

    let preSpanIdx = spanIdx;

    for (; textIdx < textLen && spanIdx < spansCount;) {

        if (preSpanIdx !== spanIdx) {
            span = para.spans[spanIdx];
            font = "normal " + span.fontSize + "px " + span.fontName;
        }

        const c = text.charCodeAt(textIdx);
        if (c === 0x0A) {
            // '\n'
            textIdx++;
            spanOffset++;
            if (spanOffset >= span.length) {
                spanOffset = 0;
                spanIdx++;
                if (graphArray && graphArray.length > 0) {
                    line.push(graphArray);
                    graphArray = undefined; //new GraphArray();
                }
            }
            if (preSpanIdx !== spanIdx) {
                line.maxFontSize = Math.max(line.maxFontSize, span.fontSize ?? 0)
            }
            preSpanIdx = spanIdx;
            continue;
        }
        const m = measure(c, font);
        const cw = m?.width ?? 0;
        
        if (cw + curX + charSpace <= endX) {
            if (!graphArray) {
                graphArray = new GraphArray();
                graphArray.attr = span;
            }
            graphArray.push({
                char: text.at(textIdx) as string,
                metrics: m,
                cw,
                index: textIdx,
                x: curX
            });

            curX += cw + charSpace;
            textIdx++;
            spanOffset++;
            if (spanOffset >= span.length) {
                spanOffset = 0;
                spanIdx++;
                line.push(graphArray);
                graphArray = undefined;
            }
            if (preSpanIdx !== spanIdx) {
                line.maxFontSize = Math.max(line.maxFontSize, span.fontSize ?? 0)
            }
        }
        else if (line.length === 0 && (!graphArray || graphArray.length === 0)) {
            if (!graphArray) {
                graphArray = new GraphArray();
                graphArray.attr = span;
            }
            graphArray.push({
                char: text.at(textIdx) as string,
                metrics: m,
                cw,
                index: textIdx,
                x: curX
            });

            line.maxFontSize = span.fontSize ?? 0;
            line.push(graphArray);
            graphArray = undefined;
            lineArray.push(line);
            line = new Line();

            curX = startX;
            textIdx++;
            spanOffset++;
            if (spanOffset >= span.length) {
                spanOffset = 0;
                spanIdx++;
            }
            else {
                line.maxFontSize = span.fontSize ?? 0;
            }
        }
        else {
            graphArray && line.push(graphArray);
            graphArray = new GraphArray();
            graphArray.attr = span;
            lineArray.push(line);
            line = new Line();
            line.maxFontSize = span.fontSize ?? 0;

            curX = startX;
            graphArray.push({
                char: text.at(textIdx) as string,
                metrics: m,
                cw,
                index: textIdx,
                x: curX
            });

            curX += cw + charSpace;
            textIdx++;
            spanOffset++;
            if (spanOffset >= span.length) {
                spanOffset = 0;
                spanIdx++;
                line.push(graphArray);
                graphArray = undefined;
            }
        }
        preSpanIdx = spanIdx;
    }

    if (graphArray && graphArray.length > 0) {
        line.push(graphArray);
    }
    if (line.length > 0) {
        lineArray.push(line);
    }

    return lineArray;
}