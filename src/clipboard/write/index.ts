import { Context } from "@/context";
import { Bundle, MossClipboard } from "@/clipboard";
import {
    Text, TableCellType, import_text, export_text, TransformRaw, CurvePoint, makeShapeTransform1By2, ContactLineView, export_shape, adapt2Shape,
    PathShape, Document
} from "@kcdesign/data";
import { compare_layer_3 } from "@/utils/group_ungroup";
import { v4 } from "uuid";

class ExfContext {
    medias = new Set<string>()
}

export class MossWriter {
    private context: Context;

    constructor(context: Context) {
        this.context = context;
    }

    private __sort_media(document: Document, exportCtx: ExfContext) {
        const media: any = {};
        exportCtx.medias.forEach(v => {
            const res = document.mediasMgr.getSync(v)?.base64;
            if (!res) return;
            media[v] = res;
        });
        return media;
    }

    private encode(identity: string, data: any, text?: string) {
        const buffer = btoa(`${identity}${encodeURIComponent(JSON.stringify(data))}`);
        return `<meta charset="utf-8"><div id="carrier" data-buffer="${buffer}">${text || ""}</div>`;
    }

    private get __text() {
        const textshape = this.context.selection.textshape;
        if (textshape) {
            const selection = this.context.textSelection;
            const start = selection.cursorStart;
            const end = selection.cursorEnd;

            if (start === end) return;

            const s = Math.min(start, end);
            const len = Math.abs(start - end);
            return textshape.text.getTextWithFormat(s, len);
        }

        const table = this.context.selection.tableshape;
        if (!table) return;

        const ts = this.context.tableSelection;
        if (ts.tableColStart < 0 && ts.tableRowStart < 0) return;

        let _text = '';

        const cells = ts.getSelectedCells(true);
        let first_text: Text | undefined = undefined;
        cells.forEach(i => {
            if (i.cell?.cellType !== TableCellType.Text) return;
            if (!first_text && i.cell.text) {
                first_text = import_text(this.context.data, i.cell.text) as Text;
            }
            const t = i.cell.text?.getText(0, i.cell.text?.length || 0) || '';
            if (!t.length) return;
            _text += t;
        })

        if (first_text && _text) {
            const t = first_text as Text;
            t.deleteText(0, t.length);
            t.insertText(_text, 0);

            return t;
        }
    }

    async write(cache: Bundle, event?: ClipboardEvent) {
        const text = this.__text;

        if (text) {
            const _text = export_text(text);
            const plain_text = text.getText(0, text.length);
            const html = this.encode(MossClipboard.paras, _text, plain_text);
            const text_html = new Blob([html || ''], { type: 'text/html' });
            const text_plain = new Blob([plain_text], { type: 'text/plain' });
            const content = [new ClipboardItem({ "text/plain": text_plain, 'text/html': text_html })];
            await navigator.clipboard.write(content);

            if (!event?.clipboardData) return;

            event.clipboardData.setData('text/plain', plain_text);
            event.clipboardData.setData('text/html', html);
            event.preventDefault();

            cache["HTML"] = html;
            cache["plain"] = plain_text;
        } else {
            let shapes = compare_layer_3(this.context.selection.selectedShapes, -1);
            if (!shapes.length) return;
            const origin_transform_map: any = {};
            const position_map: Map<string, TransformRaw> = new Map();
            const points_map: Map<string, CurvePoint[]> = new Map();

            for (let i = 0, len = shapes.length; i < len; i++) {
                const shape = shapes[i];
                origin_transform_map[`${shape.id}`] = shape.transform.clone();
                position_map.set(shape.id, makeShapeTransform1By2(shape.transform2FromRoot) as TransformRaw);
                if (shape instanceof ContactLineView) points_map.set(shape.id, shape.getPoints());
            }

            const { shapes: _shapes, ctx } = export_shape(shapes.map((s => adapt2Shape(s))));
            if (!_shapes) return;

            for (let i = 0, len = _shapes.length; i < len; i++) {
                const shape = _shapes[i];
                shape.transform = position_map.get(shape.id)!;
                const points = points_map.get(shape.id);
                if (points) {
                    (shape as PathShape).pathsegs[0].points = points.map(i => new CurvePoint(i.crdtidx, v4(), i.x, i.y, i.mode)) as any;
                }
            }

            const media = this.__sort_media(this.context.data, ctx);
            const data = {
                originTransform: origin_transform_map,
                shapes: _shapes,
                media,
            }

            const html = this.encode(MossClipboard.source, data);

            const blob = new Blob([html || ''], { type: 'text/html' });
            const item: any = { 'text/html': blob };

            await navigator.clipboard.write([new ClipboardItem(item)]);

            if (!event?.clipboardData) return;

            event.clipboardData.clearData();
            event.clipboardData.setData('text/html', html);
            event.preventDefault();
            cache["HTML"] = html;
        }
    }
}