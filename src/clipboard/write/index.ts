/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Context } from "@/context";
import { Bundle, MossClipboard, RefShapeBase, SourceBundle } from "@/clipboard";
import {
    Text,
    TableCellType,
    import_text,
    export_text,
    Transform,
    CurvePoint,
    ContactLineView,
    export_shape,
    adapt2Shape,
    PathShape,
    Document,
    ShapeView,
    SymbolRefView,
    RefUnbind,
    StyleMangerMember,
    exportMask
} from "@kcdesign/data";
import { compare_layer_3 } from "@/utils/group_ungroup";
import { v4 } from "uuid";

class ExfContext {
    medias = new Set<string>();
    styles = new Set<string>();
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

    private __sort_styles(document: Document, exportCtx: ExfContext) {
        const masks: StyleMangerMember[] = [];
        exportCtx.styles.forEach(v => {
            const mask = document.stylesMgr.getSync(v);
            if (!mask) return;
            masks.push(exportMask(mask) as StyleMangerMember);
        });
        return masks;
    }

    private __sort_symbolref(views: ShapeView[], exportCtx: ExfContext) {
        const refs = sort(views);
        const bases: RefShapeBase[] = [];
        for (const ref of refs) {
            const base = RefUnbind.unbind(ref, exportCtx);
            if (!base) continue;
            bases.push({symbol: ref.refId, base: base as any, shapeId: ref.id})
        }

        return bases;

        function sort(views: ShapeView[]) {
            const refs: SymbolRefView[] = [];
            for (const view of views) {
                if (view instanceof SymbolRefView) refs.push(view);
                if (view.childs?.length) refs.push(...sort(view.childs));
            }
            return refs;
        }
    }

    private encode(identity: string, data: any, text?: string) {
        const buffer = btoa(`${identity}${encodeURIComponent(JSON.stringify(data))}`);
        return `<meta charset="utf-8"><div id="carrier" data-buffer="${buffer}">${text || ""}</div>`;
    }

    get text() {
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
        const text = this.text;
        if (text) {
            const _text = export_text(text);
            const plain_text = text.getText(0, text.length);
            const html = this.encode(MossClipboard.paras, _text, plain_text);
            const text_html = new Blob([html || ''], { type: 'text/html' });
            const text_plain = new Blob([plain_text], { type: 'text/plain' });
            const content = [new ClipboardItem({ "text/plain": text_plain, 'text/html': text_html })];
            try {
                await navigator.clipboard.write(content);
            } catch (e) {
                console.warn(e);
                if (!event?.clipboardData) return;

                event.clipboardData.setData('text/plain', plain_text);
                event.clipboardData.setData('text/html', html);
                event.preventDefault();
            }
            cache["HTML"] = html;
            cache["plain"] = plain_text;
        } else {
            let shapes = compare_layer_3(this.context.selection.selectedShapes, -1);
            if (!shapes.length) return;
            const origin_transform_map: {[key:string]:Transform} = {};
            const position_map: Map<string, Transform> = new Map();
            const points_map: Map<string, CurvePoint[]> = new Map();
            for (let i = 0, len = shapes.length; i < len; i++) {
                const shape = shapes[i];
                origin_transform_map[`${shape.id}`] = shape.transform.clone();
                position_map.set(shape.id, (shape.matrix2Root()));
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
            const unbindRefs = this.__sort_symbolref(shapes, ctx);
            const styles = this.__sort_styles(this.context.data, ctx); // 样式收集要后于其他收集，因为其他收集的结果可能影响样式收集结果
            const data: SourceBundle = {
                originIds: _shapes.map(i => i.id),
                originTransform: origin_transform_map,
                shapes: _shapes,
                media,
                unbindRefs,
                styles,
            }

            const html = this.encode(MossClipboard.source, data);
            const blob = new Blob([html || ''], { type: 'text/html' });
            const item: any = { 'text/html': blob };
            if (!navigator.userAgent.includes('Windows') && navigator.userAgent.indexOf('Safari') > -1) {
                if (!event?.clipboardData) return;
                event.clipboardData.clearData();
                event.clipboardData.setData('text/html', html);
                event.preventDefault();
            } else {
                try {
                    await navigator.clipboard.write([new ClipboardItem(item)]);
                    cache["HTML"] = html;
                } catch (e) {
                    console.warn(e);
                    if (!event?.clipboardData) return;
                    event.clipboardData.clearData();
                    event.clipboardData.setData('text/html', html);
                    event.preventDefault();
                }
            }
            cache["HTML"] = html;
        }
    }

    async writeAsPNG(cache: Bundle, blob: Blob, name: string, width: number, height: number) {
        try {
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            const base64 = await new Promise<string>(resolve => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target!.result as string);
                reader.readAsDataURL(blob);
            });
            cache["images"] = [{ base64, name, width, height }];
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }
}