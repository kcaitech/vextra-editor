import { Context } from "@/context";
import { CurvePoint, export_text, import_text, TableCellType, Text, TransformRaw } from "@kcdesign/data";
import { compare_layer_3 } from "@/utils/group_ungroup";

interface Bundle {
    HTML?: string;
    plain?: string;
    base64?: string;
    fileInfo?: {
        name?: string;
        height?: number;
        width?: number;
    }
}
export class Clipboard {
    static identity = 'design.moss';
    static paras = 'design.moss/paras';
    static properties = 'design.moss/properties';
    static MIME = ['image/png', 'text/html', 'text/plain'];
    private context: Context;
    private cache: Bundle | undefined;
    constructor(context: Context) {
        this.context = context;
    }

    private encode(identity: string, data: any, text?: string) {
        const buffer = btoa(`${identity}${encodeURIComponent(JSON.stringify(data))}`);
        return `<meta charset="utf-8"><div id="carrier" data-buffer="${buffer}">${text || ""}</div>`;
    }

    private decode() {
    }

    private get __text() {
        const textshape = this.context.selection.textshape;
        if (textshape) {
            const selection = this.context.textSelection;
            const start = selection.cursorStart;
            const end = selection.cursorEnd;

            if (start === end) return;

            const s = Math.min(start, end);
            const len = Math.abs(start - end)
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
    /**
     * @description 先读同步，再读异步
     */
    async read(event?: ClipboardEvent) {
        const bundle: Bundle = {};
        if (event) {
            const items = event.clipboardData?.items;
            if (items) for (const item of items) {
                if (item.kind === "file") {
                    const file = item.getAsFile()!;
                    const result = await new Promise<string>((resolve) => {
                        const reader = new FileReader();
                        reader.onload = (event) => resolve(event.target!.result as string);
                        reader.readAsDataURL(file);
                    });
                    result && (bundle["base64"] = result);
                } else if (item.kind === "string") {
                    const result = await new Promise<string>(resolve => {
                        item.getAsString((result) => resolve(result));
                    });
                    if (item.type === "text/html") bundle["HTML"] = result;
                    else bundle["plain"] = result;
                }
            }
        }
        if (navigator.clipboard.read) for (const item of await navigator.clipboard.read()) for (const type of item.types) {
            if (type === "text/html") {
                const blob = await item.getType("text/html");
                bundle["HTML"] = await blob.text();
            } else if (type === "text/plain") {
                const blob = await item.getType("text/plain");
                bundle["plain"] = await blob.text();
            } else if (type.includes("image")) {
                const blob = await item.getType(type);
                bundle["base64"] = await new Promise<string>(resolve => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target!.result as string);
                    reader.readAsDataURL(blob);
                })
            }
        }

        this.cache = bundle;

        return bundle;
    }

    async write(event?: ClipboardEvent) {
        const text = this.__text;
        if (text) {
            const _text = export_text(text);
            const plain_text = text.getText(0, text.length);
            const html = this.encode(Clipboard.paras, _text, plain_text);
            let is_async_plan_enable = false;
            // @ts-ignore
            const text_html = new Blob([html || ''], { type: 'text/html' });
            const text_plain = new Blob([plain_text], { type: 'text/plain' });
            const content = [new ClipboardItem({ "text/plain": text_plain, 'text/html': text_html })];
            await navigator.clipboard.write(content);
            is_async_plan_enable = true;

            if (!event) return is_async_plan_enable;

            if (!event.clipboardData) return false;

            event.clipboardData.setData('text/plain', plain_text);
            event.clipboardData.setData('text/html', html);
            event.preventDefault();

            return true;
        } else {
            let shapes = compare_layer_3(this.context.selection.selectedShapes, -1); // 处理层级

            if (!shapes.length) return false;

            const origin_transform_map: any = {};
            const position_map: Map<string, TransformRaw> = new Map();
            const points_map: Map<string, CurvePoint[]> = new Map();
        }
    }

    init() {
    }

    destroy() {
    }
}