import { Context } from "@/context";
import {
    adapt2Shape, export_shape, export_text, makeShapeTransform1By2, import_text, getFormatFromBase64,
    creator, ShapeFrame, ContactLineView, CurvePoint, Document, PathShape, Shape, TableCellType, Text, TransformRaw, UploadAssets,
    import_shape_from_clipboard, ResourceMgr, TextShape, ArtboradView, GroupShapeView, SymbolView, PathShapeView, ShapeView
} from "@kcdesign/data";
import { compare_layer_3 } from "@/utils/group_ungroup";
import { v4 } from "uuid";
import { ImageLoader } from "@/utils/imageLoader";
import { parse as SVGParse } from "@/svg_parser";
import * as parse_svg from "@/svg_parser";
import { message } from "@/utils/message";

export type ImageBundle = {
    base64: string;
    name: string;
    width: number;
    height: number;
}

export type SVGBundle = {
    shape: Shape | undefined;
    mediaResourceMgr: ResourceMgr<{ buff: Uint8Array, base64: string }>
}
export type Bundle = {
    HTML?: string;                  // 包含图层、图层属性、文本格式
    plain?: string;                 // 纯文本
    images?: ImageBundle[];         // 图片资源
    SVG?: SVGBundle[];
}

class ExfContext {
    symbols = new Set<string>()
    medias = new Set<string>()
}

export class MossClipboard {
    static source = 'moss/source';
    static paras = 'moss/paras';
    static properties = 'moss/properties';
    static MIME = ['image/png', 'text/html', 'text/plain'];

    private readonly context: Context;
    private cache: Bundle | undefined;
    constructor(context: Context) {
        this.context = context;
    }

    private encode(identity: string, data: any, text?: string) {
        const buffer = btoa(`${identity}${encodeURIComponent(JSON.stringify(data))}`);
        return `<meta charset="utf-8"><div id="carrier" data-buffer="${buffer}">${text || ""}</div>`;
    }

    private decode(html: string) {
        let result: any;
        const d = document.createElement('div');
        document.body.appendChild(d);
        d.innerHTML = html;
        const carrier = d.querySelector('#carrier');
        result = decodeURIComponent(atob((carrier as HTMLDivElement)?.dataset?.buffer || ''));
        document.body.removeChild(d);
        return result;
    }

    private maySvgText(content: string) {
        return content.length > 10 && (content.search(/<svg|<?xml/img) > -1) && (new RegExp('</svg>', "img").test(content.slice(content.length - 10).toLowerCase()));
    }

    private async SVGFileReader(file: File): Promise<{
        shape: Shape | undefined,
        mediaResourceMgr: ResourceMgr<{ buff: Uint8Array, base64: string }>
    }> {
        return new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(parse_svg.parse(event.target!.result as string));
            reader.readAsText(file);
        });
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

    private getSource(HTML: string | undefined) {
        if (!HTML) return undefined;
        HTML = this.decode(HTML);
        return HTML && HTML.slice(0, 60).indexOf(MossClipboard.source) > -1 ? JSON.parse(HTML.split(MossClipboard.source)[1]) : undefined;
    }

    private getParas(HTML: string | undefined) {
        if (!HTML) return undefined;
        HTML = this.decode(HTML);
        return HTML && HTML.slice(0, 60).indexOf(MossClipboard.paras) > -1 ? JSON.parse(HTML.split(MossClipboard.paras)[1]) : undefined;
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

            const html = this.encode(MossClipboard.source, data);

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
        const bundle: Bundle = {};
        try {
            // 剪切板执行两种方案：ClipboardEvent方案兼容性好、navigator.clipboard方案实用性强，将两种方案融合，各取所长应对不同场景
            if (event) {
                const items = event.clipboardData?.items;
                if (items) {
                    // 拷贝一份DataTransferItemList，原因是event.clipboardData上的DataTransferItemList在异步读取一次后会清空自己(items.length = 0)，导致只能读取到一份数据
                    const data: DataTransferItem[] = [];
                    for (const d of items) data.push(d);
                    const fileList = data.filter(i => i.kind === "file").map(i => i.getAsFile()!).slice(0, 20); // 限定最多张数20
                    const stringList = data.filter(i => i.kind === "string");
                    for (const file of fileList) {
                        const type = file.type;
                        if (!type.includes("image")) continue;
                        if (file.type === "image/svg+xml") {
                            const svg = await this.SVGFileReader(file);
                            const svgs = bundle["SVG"];
                            svgs ? svgs.push(svg) : bundle["SVG"] = [svg];
                            continue;
                        }
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
                        if (size && base64) {
                            const images = bundle["images"];
                            images ? images.push(Object.assign(size, base64)) : bundle["images"] = [Object.assign(size, base64)];
                        }
                    }

                    // 同样的经过一个await之后，类型为string的DataTransferItem里面的内容会被清空，所以需要把所有DataTransferItem的读取进程收集起来放到一个await后面
                    const all: Promise<{ type: string, result: string }>[] = [];
                    for (const item of stringList) {
                        const type = item.type; // type不能放到getAsString的callback里面读取，执行callback的时候已经清空了
                        all.push(new Promise<{ type: string, result: string }>(resolve => item.getAsString((result) => resolve({ type, result }))));
                    }
                    const allResult = await Promise.all(all);
                    for (const item of allResult) {
                        if (item.type === "text/html") {
                            bundle["HTML"] = item.result;
                        } else if (item.type === "text/plain") {
                            const result = item.result;
                            if (this.maySvgText(result)) {
                                const svg = SVGParse(result);
                                const svgs = bundle["SVG"];
                                svgs ? svgs.push(svg) : bundle["SVG"] = [svg];
                            } else bundle["plain"] = result;
                        }
                    }
                }
            }
            if (!bundle["images"] && navigator.clipboard.read) for (const item of await navigator.clipboard.read()) for (const type of item.types) {
                if (type === "text/html") {
                    const blob = await item.getType("text/html");
                    bundle["HTML"] = await blob.text();
                } else if (type === "text/plain") {
                    const blob = await item.getType("text/plain");
                    const text = await blob.text();
                    if (this.maySvgText(text)) {
                        const svg = SVGParse(text);
                        const svgs = bundle["SVG"];
                        svgs ? svgs.push(svg) : bundle["SVG"] = [svg];
                    } else bundle["plain"] = text;
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
                    if (size && base64) {
                        const images = bundle["images"];
                        images ? images.push(Object.assign(size, base64)) : bundle["images"] = [Object.assign(size, base64)];
                    }
                }
            }

            // 两种方案都没有获取到有效内容，使用缓存
            if (!Object.keys(bundle).length) return this.cache;

            this.cache = bundle;

            return bundle;
        } catch (e) {
            // 在用户没有给予剪切板权限、safari浏览器下常常会抛出异常
            console.warn(e);
            return bundle;
        } finally {
            console.log('--bundle--', bundle);
        }
    }

    /**
     * @description 通过监听浏览器粘贴事件触发(类似“粘贴在这里”，“粘贴图层属性”这类非通过Ctrl + V触发的不属于浏览器粘贴事件，属于自定义粘贴事件)
     */
    async paste(event: ClipboardEvent) {
        // 读取剪切板
        const bundle = await this.read(event);
        if (!bundle || !Object.keys(bundle).length) return false; // 剪切板没有可用于粘贴的内容

        let { images, SVG, HTML, plain } = bundle;
        const source = this.getSource(HTML);    // 图层
        const paras = this.getParas(HTML);      // 文本段落

        if (images) {
            const allMedia: (SVGBundle | ImageBundle)[] = [...images, ...(SVG ? SVG : [])];
            if (allMedia.length > 1) {
                // 图片资源数量大于1，视作插入多张图片(与从文件夹中直接选择多个文件的场景类似)
                new ImageLoader(this.context).insertImageFromClip(allMedia);
            } else {
                const context = this.context;
                const selected = context.selection.selectedShapes;
                if (selected) {
                    const container: (ArtboradView | GroupShapeView | SymbolView)[] = selected.filter(view => {
                        return view instanceof ArtboradView || view instanceof GroupShapeView || view instanceof SymbolView;
                    }) as ArtboradView[];
                    const pathviews: PathShapeView[] = selected.filter(view => view instanceof PathShapeView) as PathShapeView[];

                    if (container.length) {

                    } else if (pathviews.length) {
                        // todo 检查一下黑白格的问题
                        const { base64, width, height } = images[0];
                        const buff = Uint8Array.from(atob(base64.split(",")[1]), c => c.charCodeAt(0));
                        const format = getFormatFromBase64(base64);
                        const ref = `${v4()}.${format}`;
                        const media = { buff, base64 };
                        const actions: {
                            shape: ShapeView,
                            ref: string,
                            width: number,
                            height: number,
                            media: { buff: Uint8Array, base64: string }
                        }[] = [];
                        for (const view of pathviews) actions.push({ shape: view as any, ref, width, height, media });
                        const page = context.selection.selectedPage!;
                        const editor = context.editor4Page(page);
                        editor.setShapesFillAsImage(actions);
                        new ImageLoader(context).upload(selected.map(shape => ({ shape, upload: [{ buff, ref }] })));
                    } else new ImageLoader(context).insertImageFromClip(allMedia);
                } else new ImageLoader(context).insertImageFromClip(allMedia);
            }
        } else if (SVG) {
            new ImageLoader(this.context).insertImageFromClip(SVG);
        } else if (source) {

        } else if (paras) {

        } else if (plain) {

        }
    }

    async pasteHere() {
    }

    async replace() {
        const shapes = this.context.selection.selectedShapes;
        if (!shapes.length) return;

        const bundle = await this.read();
        if (!bundle || !Object.keys(bundle).length) return false; // 剪切板内没有可用的替换内容

        let { HTML, plain, images, SVG } = bundle;

        const source = this.getSource(HTML);
        const paras = this.getParas(HTML);

        if (images) {
            // 用图片生成图层
            const context = this.context;
            const source: Shape[] = [];
            const assets: UploadAssets[] = [];
            for (const image of images) {
                let { base64, name, width, height } = image;
                const buff = Uint8Array.from(atob(base64.split(",")[1]), c => c.charCodeAt(0));
                const format = getFormatFromBase64(base64);
                const ref = `${v4()}.${format}`;
                const manager = context.data.mediasMgr;
                manager.add(ref, { buff, base64 });
                name = name.replace(new RegExp(`.${format}|.jpg$`, 'img'), '') || 'image';
                const frame = new ShapeFrame(0, 0, width, height);
                const asset: UploadAssets = { buff, ref };
                assets.push(asset);
                source.push(creator.newImageFillShape(name, frame, manager, { width, height }, ref));
            }
            const editor = context.editor4Page(context.selection.selectedPage!);
            const result = editor.replace(context.data, source, shapes.map((s) => adapt2Shape(s)));
            if (!result || !result.length) return;
            new ImageLoader(context).upload(result.map(shape => ({ shape, upload: assets }))).then(result => {
                if (!result) message("danger", context.workspace.t('system.uploadMediaFail'));
            });
        } else if (source) {
            // 检查有没有图层内容
            const context = this.context;
            const page = context.selection.selectedPage!;
            const shapes = import_shape_from_clipboard(context.data, page.data, source.shapes, source.media);
            if (!shapes.length) throw new Error('invalid source');
            // 进行替换
            const editor = context.editor4Page(page);
            const result = editor.replace(context.data, shapes, context.selection.selectedShapes.map((s) => adapt2Shape(s)));
            if (!result || !result.length) return;
            const keys = Object.keys(source.media);
            const assets: UploadAssets[] = [];
            for (const ref of keys) {
                const buff = source.media[ref]?.buff;
                buff && assets.push({ ref, buff });
            }
            const uploadPackages = result.map(shape => ({ shape, upload: assets }));
            new ImageLoader(context).upload(uploadPackages).then(result => {
                if (!result) message("danger", context.workspace.t('system.uploadMediaFail'));
            });
        } else if (paras) {
            // 用文本段落生成图层
            const text = import_text(this.context.data, paras, true);
            const context = this.context;
            const shape: TextShape = (text as TextShape);
            const layout = shape.getLayout();
            shape.size.width = layout.contentWidth;
            shape.size.height = layout.contentHeight;
            context.editor4Page(context.selection.selectedPage!)
                .replace(context.data, [shape], context.selection.selectedShapes.map((s) => adapt2Shape(s)));
        } else if (plain) {
            // 用纯文本生成图层
            const name = plain.length >= 20 ? plain.slice(0, 19) + '...' : plain;
            const shape = creator.newTextShape(name);
            shape.text.insertText(plain, 0);
            const layout = shape.getLayout();
            shape.size.width = layout.contentWidth;
            shape.size.height = layout.contentHeight;
            const context = this.context;
            // 进行替换
            context.editor4Page(context.selection.selectedPage!)
                .replace(context.data, [shape], context.selection.selectedShapes.map((s) => adapt2Shape(s)));
        } else if (SVG) {
            const source: Shape[] = [];
            const assets: UploadAssets[] = [];
            for (const svg of SVG) {
                const { shape, mediaResourceMgr } = svg;
                if (!shape) continue;
                source.push(shape);
                const upload: UploadAssets[] = [];
                mediaResourceMgr.forEach((v, k) => upload.push({ ref: k, buff: v.buff }));
                assets.push(...upload)
            }
            const context = this.context;
            const editor = context.editor4Page(context.selection.selectedPage!);
            const result = editor.replace(context.data, source, shapes.map((s) => adapt2Shape(s)));
            if (!result || !result.length) return;
            new ImageLoader(context).upload(result.map(shape => ({ shape, upload: assets }))).then(result => {
                if (!result) message("danger", context.workspace.t('system.uploadMediaFail'));
            });
        }
    }

    async cut() {

    }

    init() {
    }

    destroy() {
    }
}