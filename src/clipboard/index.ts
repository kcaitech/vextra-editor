import { Context } from "@/context";
import {
    adapt2Shape,
    export_shape,
    export_text,
    makeShapeTransform1By2,
    import_text,
    getFormatFromBase64,
    creator,
    ShapeFrame,
    ContactLineView,
    CurvePoint,
    Document,
    PathShape,
    Shape,
    TableCellType,
    Text,
    TransformRaw, UploadAssets
} from "@kcdesign/data";
import { compare_layer_3 } from "@/utils/group_ungroup";
import { v4 } from "uuid";
import { ImageLoader } from "@/utils/imageLoader";

interface ImageBundle {
    base64: string;
    name: string;
    width: number;
    height: number;
}
interface Bundle {
    HTML?: string;          // 包含图层、图层属性、文本格式
    plain?: string;         // 纯文本
    image?: ImageBundle;    // 图片资源
    SVG?: Shape;            // 矢量图形
}

class ExfContext {
    symbols = new Set<string>()
    medias = new Set<string>()
}

export class MossClipboard {
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

    private __sort_media(document: Document, exportCtx: ExfContext) {
        const media: any = {};
        exportCtx.medias.forEach(v => {
            const res = document.mediasMgr.getSync(v)?.base64;
            if (!res) return;
            media[v] = res;
        });
        return media;
    }

    async write(event?: ClipboardEvent): Promise<boolean> {
        const text = this.__text;
        const cache: Bundle = {};
        if (text) {
            const _text = export_text(text);
            const plain_text = text.getText(0, text.length);
            const html = this.encode(MossClipboard.paras, _text, plain_text);
            let is_async_plan_enable;
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

            cache["HTML"] = html;
            cache["plain"] = plain_text;
        } else {
            let shapes = compare_layer_3(this.context.selection.selectedShapes, -1);
            if (!shapes.length) return false;
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
            if (!_shapes) return false;

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

            const html = this.encode(MossClipboard.identity, data);

            let is_async_plan_enable;

            const blob = new Blob([html || ''], { type: 'text/html' });
            const item: any = { 'text/html': blob };

            await navigator.clipboard.write([new ClipboardItem(item)]);

            is_async_plan_enable = true;

            if (!event?.clipboardData) return is_async_plan_enable;

            event.clipboardData.clearData();
            event.clipboardData.setData('text/html', html);
            event.preventDefault();
            cache["HTML"] = html;
        }
        return true;
    }

    async read(event?: ClipboardEvent): Promise<Bundle | undefined> {
        // 剪切板执行两种方案：ClipboardEvent方案兼容性好、navigator.clipboard方案实用性强，将两种方案融合，各取所长应对不同场景
        const bundle: Bundle = {};

        if (event) {
            const items = event.clipboardData?.items;
            if (items) for (const item of items) {
                if (item.kind === "file") {
                    const file = item.getAsFile()!;
                    const size = await new Promise<{
                        width: number,
                        height: number
                    }>(resolve => {
                        const img = new Image();
                        img.src = URL.createObjectURL(file);
                        img.onload = () => resolve({ width: img.width, height: img.height });
                    });
                    const base64 = await new Promise<{
                        name: string,
                        base64: string
                    }>(resolve => {
                        const reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onload = (event) => {
                            const base64 = event?.target?.result as string;
                            if (base64) resolve({
                                base64,
                                name: file.name || this.context.workspace.t('shape.image')
                            });
                        }
                    });
                    size && base64 && (bundle["image"] = Object.assign(size, base64));
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
                const base64 = await new Promise<{
                    name: string,
                    base64: string
                }>(resolve => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve({ name: this.context.workspace.t('shape.image'), base64: e.target!.result as string });
                    reader.readAsDataURL(blob);
                });
                const size = await new Promise<{
                    width: number,
                    height: number
                }>(resolve => {
                    const img = new Image();
                    img.src = URL.createObjectURL(blob);
                    img.onload = () => resolve({ width: img.width, height: img.height });
                });
                base64 && size && (bundle["image"] = Object.assign(size, base64));
            }
        }

        // 两种方案都没有获取到有效内容，使用缓存
        if (!Object.keys(bundle).length) return this.cache;

        this.cache = bundle;

        return bundle;
    }

    async replace() {
        const shapes = this.context.selection.selectedShapes;
        if (!shapes.length) return;

        const bundle = await this.read();
        if (!bundle || !Object.keys(bundle).length) return false; // 剪切板内没有可用的替换内容
        const { HTML, plain, image, SVG } = bundle;

        if (image) {
            // 先用图片生成图层
            let { base64, name, width, height } = image;
            const buff = Uint8Array.from(atob(base64.split(",")[1]), c => c.charCodeAt(0));
            const format = getFormatFromBase64(base64);
            const ref = `${v4()}.${format}`;
            const context = this.context;
            const manager = context.data.mediasMgr;
            manager.add(ref, { buff, base64 });
            name = name.replace(new RegExp(`.${format}|.jpg$`, 'img'), '') || 'image';
            const frame = new ShapeFrame(0, 0, width, height);
            const source = [creator.newImageFillShape(name, frame, manager, { width, height }, ref)];
            const editor = context.editor4Page(context.selection.selectedPage!);
            const result = editor.replace(context.data, source, shapes.map((s) => adapt2Shape(s)));
            if (!result || !result.length) return;
            const asset: UploadAssets = { buff, ref };
            new ImageLoader(context).upload(result.map(shape => ({ shape, upload: [asset] }))).then(result => {
                if (!result) {
                    // 图片上传失败
                }
            });
        } else if (HTML) {
            // 检查有没有图层内容
        } else if (plain) {
            // 先用文本生成图层
        } else if (SVG) {
        }
    }

    init() {
    }

    destroy() {
    }
}