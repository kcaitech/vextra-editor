import {
    adapt2Shape,
    BasicArray,
    Blur,
    Border,
    BorderPosition,
    BorderSideSetting,
    BorderStyle,
    ColVector3D, ContactLineView,
    CornerType,
    CurvePoint,
    Document,
    export_shape,
    export_text,
    GroupShape,
    GroupShapeView,
    import_shape_from_clipboard,
    import_text,
    makeShapeTransform1By2,
    makeShapeTransform2By1, MossError,
    Page,
    PathShape,
    Shape,
    ShapeType,
    ShapeView,
    StrokePaint,
    TableCellType,
    Text,
    TextShape,
    TextShapeEditor,
    Transform,
    TransformRaw
} from '@kcdesign/data';
import { Context } from '@/context';
import { PageXY, XY } from '@/context/selection';
import { hidden_selection, Media, SVGReader } from '@/utils/content';
import { message } from './message';
import { XYsBounding } from './common';
import { compare_layer_3 } from './group_ungroup';
import { v4 } from 'uuid';
import { ElMessage } from 'element-plus';
import { parse as SVGParse } from "@/svg_parser";
import { WorkSpace } from "@/context/workspace";
import { BorderData, get_blur, get_borders, get_fills, get_shadows } from "@/utils/shape_style";
import { exportBlur, exportBorder, exportFill, exportShadow } from '@kcdesign/data';
import { flattenShapes } from "@/utils/cutout";
import { getContextSetting, getMarkType, getRadiusForCopy, getText } from "@/utils/attri_setting";
import { UploadAssets } from "@kcdesign/data";
import { StyleManager } from "@/transform/style";
import { ImageLoader } from "@/imageLoader";

interface SystemClipboardItem {
    type: ShapeType
    contentType: string
    content: Media | string
}

class ExfContext {
    symbols = new Set<string>()
    medias = new Set<string>()
}

type CacheType = 'inner-html' | 'plain-text' | 'double' | 'image';
const identity = 'moss/source';
const paras = 'moss/paras'; // 文字段落
const properties = 'moss/properties'; // 图层属性

export class Clipboard {
    context: Context;
    private cache: { type: CacheType, data: any } | undefined;
    private m_envs: Set<string> = new Set();

    constructor(context: Context) {
        this.context = context;
    }

    get text() {
        const textshape = this.context.selection.textshape;
        if (textshape) {
            const selection = this.context.textSelection;
            const start = selection.cursorStart;
            const end = selection.cursorEnd;

            if (start === end) {
                return;
            }

            const s = Math.min(start, end);
            const len = Math.abs(start - end)
            return textshape.text.getTextWithFormat(s, len);
        }

        const table = this.context.selection.tableshape;
        if (!table) {
            return;
        }

        const ts = this.context.tableSelection;

        if (ts.tableColStart < 0 && ts.tableRowStart < 0) {
            return;
        }

        let _text = '';

        const cells = ts.getSelectedCells(true);
        let first_text: Text | undefined = undefined;
        cells.forEach(i => {
            if (i.cell?.cellType !== TableCellType.Text) {
                return;
            }
            if (!first_text && i.cell.text) {
                first_text = import_text(this.context.data, i.cell.text) as Text;
            }
            const t = i.cell.text?.getText(0, i.cell.text?.length || 0) || '';
            if (!t.length) {
                return;
            }
            _text += t;
        })

        if (!first_text || !_text) {
            console.log('!first_text || !_text');
            return;
        }

        const t = first_text as Text;
        t.deleteText(0, t.length);
        t.insertText(_text, 0);

        return t;
    }

    modify_cache(type: CacheType, data: any) {
        this.cache = { type, data };
    }

    write(event?: ClipboardEvent): boolean {
        try {
            const text = this.text;
            if (text) {
                return this.write_text(text, event);
            } else {
                return this.write_shapes(event);
            }
        } catch (error) {
            console.log('write error:', error);
            return false;
        }

    }

    write_text(text: Text, event?: ClipboardEvent): boolean {
        const _text = export_text(text);

        const plain_text = text.getText(0, text.length);

        const h = encode_html(paras, _text, plain_text);

        let is_async_plan_enable = false;
        // 异步方案
        // @ts-ignore
        if (navigator.clipboard && navigator.clipboard.read) {
            const text_html = new Blob([h || ''], { type: 'text/html' });
            const text_plain = new Blob([plain_text], { type: 'text/plain' });

            const content = [new ClipboardItem({ "text/plain": text_plain, 'text/html': text_html })];

            navigator.clipboard.write(content);

            is_async_plan_enable = true;
        }

        if (!event) return is_async_plan_enable;

        if (!event.clipboardData) return false;

        event.clipboardData.setData('text/plain', plain_text);
        event.clipboardData.setData('text/html', h);
        event.preventDefault();

        this.modify_cache('double', { 'text/plain': plain_text, 'text/html': h });

        return true;
    }

    write_shapes(event?: ClipboardEvent) {
        let shapes = compare_layer_3(this.context.selection.selectedShapes, -1); // 处理层级

        if (!shapes.length) {
            return false;
        }

        const origin_transform_map: any = {};
        const position_map: Map<string, TransformRaw> = new Map();
        const points_map: Map<string, CurvePoint[]> = new Map();
        this.m_envs.clear();

        for (let i = 0, len = shapes.length; i < len; i++) {
            const shape = shapes[i];

            origin_transform_map[`${shape.id}`] = shape.transform.clone();

            position_map.set(shape.id, (shape.matrix2Root()));

            if (shape instanceof ContactLineView) {
                points_map.set(shape.id, shape.getPoints());
            }

            if ([ShapeType.Artboard, ShapeType.Group].includes(shape.type)) {
                this.m_envs.add(shape.id);
            }
        }

        // 先导出将要写入的数据
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

        const media = sort_media(this.context.data, ctx);
        const data = {
            originTransform: origin_transform_map,
            shapes: _shapes,
            media,
        }

        const h = encode_html(identity, data);

        let is_async_plan_enable = false;
        // 转义修改好的数据并写入
        // @ts-ignore
        if (navigator.clipboard && navigator.clipboard.write) { // 支持异步接口
            const blob = new Blob([h || ''], { type: 'text/html' });
            const item: any = { 'text/html': blob };

            navigator.clipboard.write([new ClipboardItem(item)]); // 异步的复制让它自己慢慢复制去

            is_async_plan_enable = true;
        }

        if (!event?.clipboardData) {
            return is_async_plan_enable;
        }

        event.clipboardData.clearData();
        event.clipboardData.setData('text/html', h);
        event.preventDefault();

        this.modify_cache('inner-html', h);

        return true;
    }

    write_properties() {
        try {
            const selected = this.context.selection.selectedShapes;
            const flatten = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
            const fills = get_fills(flatten);
            const { border, stroke_paints } = get_borders(flatten);
            const shadows = get_shadows(selected);
            const blur = get_blur(selected);

            const radius = getRadiusForCopy(selected);
            const contextSetting = getContextSetting(selected);
            const mark = getMarkType(selected);
            const text = getText(selected);

            const data: any = {};
            if (fills !== "mixed") data['fills'] = fills.map(i => exportFill(i.fill));
            if (typeof stroke_paints !== 'string' && !this.borderIsString(border)) {
                const paints = new BasicArray<StrokePaint>();
                (stroke_paints).forEach(i => paints.push(i.strokePaint));
                const b = new Border(border.position as BorderPosition, border.borderStyle as BorderStyle, border.cornerType as CornerType, border.sideSetting as BorderSideSetting, paints);
                data['borders'] = exportBorder(b);
            }
            if (shadows !== "mixed") data['shadows'] = shadows.map(i => exportShadow(i.shadow));
            if (blur instanceof Blur) data['blur'] = exportBlur(blur);
            if (radius) data['radius'] = radius;
            if (contextSetting) data['contextSetting'] = contextSetting;
            if (mark) data['mark'] = mark;
            if (text) data['text'] = text;

            const code = encode_html(properties, data);

            // @ts-ignore
            if (!navigator.clipboard?.read) return false;
            const html = new Blob([code || ''], { type: 'text/html' });
            const content = [new ClipboardItem({ 'text/html': html })];
            navigator.clipboard.write(content);
            return true;
        } catch (e) {
            console.log('write_properties error:', e);
            return false;
        }
    }
    borderIsString(border: BorderData) {
        Object.values(border).forEach(value => {
            if (typeof value === 'string') return true;
        });
        return false;
    }

    async paste_properties(event?: ClipboardEvent) {
        try {
            // @ts-ignore
            if (navigator.clipboard.read || !event) {
                const data = await navigator.clipboard.read();
                if (!data) throw new Error('No valid data on clipboard.');
                const d = data[0];
                if (d.types.length !== 1 || d.types[0] !== 'text/html') throw new Error('No valid data on clipboard.');
                const val = await d.getType('text/html');
                if (!val) throw new Error('invalid value');
                let text_html = await val.text();
                text_html = decode_html(text_html);
                if (!(text_html && typeof text_html === 'string')) throw new Error('read failure');
                const is_properties = text_html.slice(0, 70).indexOf(properties) > -1; // 图层属性
                if (!is_properties) throw new Error('invalid value');
                const source = JSON.parse(text_html.split(properties)[1]);
                const selection = this.context.selection;
                const editor = this.context.editor4Page(selection.selectedPage!);
                editor.pasteProperties(selection.selectedShapes, source);
                hidden_selection(this.context);
            }
        } catch (error) {
            console.log('paste error:', error);
        }
    }

    writeBlob(blob: Blob) {
        try {
            if (navigator.clipboard && navigator.clipboard.write) {
                navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                return true;
            } else {
                throw new Error('navigator.clipboard.write is not supported');
            }
        } catch (e) {
            console.log('write_png error:', e);
            return false;
        }
    }

    write_png(url: string) {
        try {
            if (navigator.clipboard && navigator.clipboard.write) {
                const bytes = atob(url);
                const ab = new ArrayBuffer(bytes.length)
                const ua = new Uint8Array(ab)

                for (let i = 0; i < bytes.length; i++) {
                    ua[i] = bytes.charCodeAt(i)
                }

                const blob = new Blob([ab], { type: 'image/png' });

                navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                return true;
            } else {
                throw new Error('navigator.clipboard.write is not supported');
            }
        } catch (e) {
            console.log('write_png error:', e);
            return false;
        }
    }

    cut(event: ClipboardEvent) {
        try {
            const res = this.write(event);
            if (!res) return;

            const textshape = this.context.selection.textshape;
            const text = this.text;

            if (text && textshape) {
                const selection = this.context.textSelection;
                const start = selection.cursorStart;
                const end = selection.cursorEnd;
                if (start === end) return;

                const editor = this.context.editor4TextShape(textshape);

                if (editor.deleteText(Math.min(start, end), Math.abs(start - end))) {
                    selection.setCursor(Math.min(start, end), false);
                }
                return;
            }

            const table = this.context.selection.tableshape;
            if (text && table) {
                const editor = this.context.editor4Table(table);
                const ts = this.context.tableSelection;
                editor.resetTextCells(ts.tableRowStart, ts.tableRowEnd, ts.tableColStart, ts.tableColEnd);
                ts.resetSelection();
                return;
            }

            const page = this.context.selection.selectedPage;
            if (!page) return;

            const editor = this.context.editor4Page(page);
            const delete_res = editor.delete_batch(this.context.selection.selectedShapes);

            if (delete_res) {
                this.context.selection.resetSelectShapes();
            }
        } catch (error) {
            return;
        }
    }

    async paste(t: Function, event?: ClipboardEvent, xy?: PageXY) {
        try {
            // @ts-ignore
            if (navigator.clipboard.read) {
                if (await this.paste_async(t, xy)) return;
            }

            if (!event) return;

            // paste 监听事件触发，优先读取 '同步剪切板' 内容里面的内容
            const items = event.clipboardData && event.clipboardData.items;
            if (items?.length) {
                return this.paste_datatransfer_item_list(items, t, xy);
            }

            // 如果上述操作未能读取到有效内容，则尝试读取缓存
            this.paste_cache(t, xy);
        } catch (error) {
            console.log('paste error:', error);
        }
    }

    async paste_async(t: Function, xy?: PageXY) {
        try {
            if (!navigator.clipboard?.read) throw new Error('Not support.');
            const data = await navigator.clipboard.read();
            if (!data) throw new Error('No valid data on clipboard.');
            this.paste_clipboard_items(data, t, xy);
            return true;
        } catch (error) {
            console.log('paste_async error:', error);
            return this.paste_cache(t, xy);
        }
    }

    async paste_datatransfer_item_list(data: DataTransferItemList, t: Function, xy?: PageXY) {
        if (data.length > 1) {
            let h: DataTransferItem | undefined = undefined;
            let p: DataTransferItem | undefined = undefined;

            for (let i = 0; i < data.length; i++) {
                const d = data[i];
                if (d.type === 'text/html') {
                    h = d;
                } else if (d.type === 'text/plain') {
                    p = d;
                }
            }

            if (h && p) {
                let html = await getHtmlAsync(h);
                let text = await getTextAsync(p);
                const firstSuccess = handle_text_html_string(this.context, html);
                if (firstSuccess) {
                    this.modify_cache('inner-html', html);
                    return;
                }
                this.modify_cache('plain-text', text);
                clipboard_text_plain2(this.context, text, xy);
                return;
            }
        }
        if (is_html(data)) {
            const html = get_html(data);
            if (!html) {
                return;
            }
            html.getAsString(val => {
                const html = decode_html(val);
                this.modify_cache('inner-html', val);
                handle_text_html_string(this.context, html);
            });
            return;
        }

        if (is_plain(data)) {
            const plain = get_plain(data);
            if (!plain) {
                return;
            }
            plain.getAsString(text => {
                this.modify_cache('plain-text', text);
                clipboard_text_plain2(this.context, text, xy);
            });
            return;
        }

        const image = get_image(data);
        if (image) {
            const file = image.getAsFile();
            const type = image.type;
            this.modify_cache('image', { file, type });
            image_reader(this.context, file, type, t, xy);
        }
    }

    paste_clipboard_items(data: ClipboardItems, t: Function, xy?: PageXY) {
        if (!data) {
            message('info', t('clipboard.invalid_data'));
            return;
        }

        const d = data[0]; // 剪切板内的数据

        const __this = this;

        const type = (function () {
            const types = d.types; // 剪切板内的数据类型

            if (types.length > 1 && types.includes('text/plain') && types.includes('text/html')) {
                __this.couple(__this.context, d, xy);
                return;
            }

            for (let i = 0; i < types.length; i++) {
                const type = types[i];

                if (/image/.test(type)) {
                    return 'image';
                } else if (type === 'text/plain') {
                    return type;
                } else if (type === 'text/html') {
                    return type;
                }
            }
        })();

        if (type === 'image') {
            clipboard_image(this.context, d, t, xy);
        } else if (type === 'text/plain') {
            clipboard_text_plain(this.context, d, xy);
        } else if (type === 'text/html') {
            clipboard_text_html(this.context, d, xy);
        }
    }

    async couple(context: Context, data: any, xy?: PageXY) {
        try {
            // 解析data
            const val = await data.getType('text/html');

            if (!val) {
                throw new Error('invalid value');
            }

            let text_html = await val.text();
            text_html = decode_html(text_html);

            let successFirst = false;

            if (text_html && typeof text_html === 'string') {
                successFirst = handle_text_html_string(context, text_html, xy);
            }

            if (!successFirst) {
                clipboard_text_plain(this.context, data, xy);
            }
        } catch (error) {
            console.log(error);
            message('info', context.workspace.t('clipboard.invalid_data'));
        }
    }

    paste_cache(t: Function, xy?: PageXY) {
        if (!this.cache) return false;

        const { type, data } = this.cache;

        if (type === 'inner-html') {
            handle_text_html_string(this.context, decode_html(data), xy);
        } else if (type === 'plain-text') {
            clipboard_text_plain2(this.context, data, xy);
        } else if (type === 'image') {
            image_reader(this.context, data.file, data.type, t, xy)
        } else if (type === 'double') {
            const text = data['text/plain'];
            clipboard_text_plain2(this.context, text, xy);
        }
        return true;
    }

    paste_cache_for_text() {
        if (!this.cache) return;

        const { data, type } = this.cache;

        let html;
        if (type === 'inner-html') {
            html = decode_html(data);
        } else if (type === 'double') {
            html = decode_html(data['text/html']);
        }

        if (html
            && html.slice(0, 70).indexOf(paras) > -1
            && this.insert_paras(html)
        ) return;

        let plain;
        if (type === 'plain-text') {
            plain = data;
        } else if (type === 'double') {
            plain = decode_html(data['text/plain']);
        }

        if (!plain) return;

        this.paste_for_no_format_text(plain);
    }

    paste_text(event?: ClipboardEvent) {
        try {
            if (!event) {
                return this.paste_text_async();
            }

            const items = event.clipboardData && event.clipboardData.items;

            if (items?.length) {
                return this.paste_text_sync(items);
            }

            this.paste_cache_for_text();
        } catch (error) {
            console.log('paste_text error:', error);
        }
    }

    async paste_text_async() {
        if (navigator.clipboard && navigator.clipboard.read) {
            const data = await navigator.clipboard.read();
            const _d = data[0];
            const types = _d.types;

            const text_shape = this.context.selection.textshape;

            if (!text_shape) {
                return;
            }

            const editor = this.context.editor4TextShape(text_shape);

            if (types.length === 1) {
                const type = types[0];
                if (type === 'text/plain') {
                    const val = await _d.getType('text/plain');
                    const text = await val.text();

                    if (!(text && typeof text === 'string')) {
                        throw new Error('invalid text');
                    }

                    const selection = this.context.textSelection;
                    const start = selection.cursorStart;
                    const end = selection.cursorEnd;
                    const s = Math.min(start, end);

                    if (start !== end) {
                        editor.deleteText(Math.min(start, end), Math.abs(start - end))
                    }

                    editor.insertText(text, s);

                    selection.setCursor(s + text.length, false);
                } else if (type === 'text/html') {
                    paster_html_or_plain_inner_shape(_d, this.context, editor, false);
                }
            } else if (types.length === 2) {
                if (types.includes('text/html') && types.includes('text/plain')) {
                    paster_html_or_plain_inner_shape(_d, this.context, editor, false);
                }
            }
        } else {
            this.paste_cache_for_text();
        }
    }

    paste_text_sync(items: DataTransferItemList) {
        const html = get_html(items);

        if (html) {
            this.paste_text_sync_for_html(items, html);
            return;
        }

        const plain = get_plain(items);
        if (plain) {
            this.paste_text_sync_for_plain(plain);
        }
    }

    paste_text_sync_for_plain(plain: DataTransferItem) {
        plain.getAsString(text => {
            this.paste_for_no_format_text(text);
        });
    }

    paste_text_sync_for_html(items: DataTransferItemList, html: DataTransferItem) {
        html.getAsString(val => {
            const html = decode_html(val);

            const is_paras = html.slice(0, 70).indexOf(paras) > -1; // 文本段落
            if (is_paras) {
                this.insert_paras(html);
                return;
            }

            const plain = get_plain(items);
            if (!plain) {
                return;
            }
            this.paste_text_sync_for_plain(plain)
        })
    }

    async paste_for_no_format_text(t?: string) {
        const text = t || (await this.get_plain_text_for_paster_text());
        const l = text.length;
        if (!l) {
            return;
        }

        const text_shape = this.context.selection.textshape;
        if (!text_shape) {
            return;
        }

        const editor = this.context.editor4TextShape(text_shape);

        const selection = this.context.textSelection;

        const start = selection.cursorStart;
        const end = selection.cursorEnd;

        const s = Math.min(start, end);

        if (start !== end) {
            editor.deleteText(s, Math.abs(start - end));
        }

        editor.insertText(text, s);

        selection.setCursor(s + l, false);
    }

    async get_plain_text_for_paster_text() {
        if (navigator.clipboard?.read) {
            const data = await navigator.clipboard.read();

            if (!data?.length) {
                return ''
            }

            const _d = data[0];

            return (await _d.getType('text/plain')).text() || '';
        }

        if (!this.cache) return '';

        const { data, type } = this.cache;

        if (type === 'plain-text') {
            return data as string;
        } else if (type === 'double') {
            return data['text/plain'] as string
        } else {
            return '';
        }
    }

    insert_paras(html: string) {
        const text_shape = this.context.selection.textshape;
        if (!text_shape) {
            return false;
        }

        const editor = this.context.editor4TextShape(text_shape);

        const selection = this.context.textSelection;
        const start = selection.cursorStart;
        const end = selection.cursorEnd;
        const s = Math.min(start, end);
        const source = JSON.parse(html.split(`${paras}`)[1]);
        const text = import_text(this.context.data, source, false) as Text;
        const res = editor.insertFormatText(text, s, Math.abs(start - end));
        selection.setCursor(s + text.length, false);

        return res;
    }

    async replace() {
        try {
            const src = this.context.selection.selectedShapes;

            if (!navigator.clipboard.read) return this.replace_sync(src);

            const data = await navigator.clipboard.read();
            if (!(data && data.length)) throw new Error('invalid data');
            const is_inner_shape = data[0].types.length === 1 && data[0].types[0] === 'text/html';
            if (!is_inner_shape) {
                // todo
                // const loader = new ImageLoader(this.context);
                // const type = data[0].types[0];
                // const val = await data[0].getType(type);
                // const filePack = await loader.packFile(val as any, true);
                throw new MossError('external data');
            }
            clipboard_text_html_replace(this.context, data[0], src);
            return true;
        } catch (error) {
            console.error(error);
            message('info', "替换失败");
            return false;
        }
    }

    replace_sync(src: ShapeView[]) {
        if (!this.cache) {
            throw new Error('no cache');
        }

        const { type, data } = this.cache;

        if (type !== 'inner-html') {
            throw new Error('wrong cache');
        }

        replace_action(this.context, data, src)
    }

    get envs() {
        return this.m_envs;
    }
}

function sort_media(document: Document, exportCtx: ExfContext) {
    const media: any = {};
    exportCtx.medias.forEach(v => {
        const res = document.mediasMgr.getSync(v)?.base64;
        if (!res) return;
        media[v] = res;
    });
    return media;
}

async function paster_html_or_plain_inner_shape(_d: any, context: Context, editor: TextShapeEditor, only_text?: boolean) {
    if (only_text) {
        paster_plain_inner_shape(_d, context, editor);
    } else {
        const val = await _d.getType('text/html');
        let text_html = await val.text();
        text_html = decode_html(text_html);
        if (!(text_html && typeof text_html === 'string')) {
            console.log('invalid text/html');
            paster_plain_inner_shape(_d, context, editor);
            return false;
        }
        if (!(text_html.slice(0, 70).indexOf(`${paras}`) > -1)) {
            console.log('wrong text/html');
            paster_plain_inner_shape(_d, context, editor);
            return false;
        }
        const selection = context.textSelection;
        const start = selection.cursorStart;
        const end = selection.cursorEnd;
        const s = Math.min(start, end);
        const source = JSON.parse(text_html.split(`${paras}`)[1]);
        if (source.paras[0].spans.length > 0 && source.paras[0].spans[0].placeholder) {
            source.paras[0].spans[0].placeholder = false;
            source.paras[0].text = source.paras[0].text.slice(1);
        }
        const text = import_text(context.data, source, false) as Text;

        editor.insertFormatText(text, s, Math.abs(start - end));
        selection.setCursor(s + text.length, false);
    }
    return true;
}

async function paster_plain_inner_shape(_d: any, context: Context, editor: TextShapeEditor) {
    const selection = context.textSelection;
    const start = selection.cursorStart;
    const end = selection.cursorEnd;
    const s = Math.min(start, end);
    const val = await _d.getType('text/plain');
    if (!val) {
        console.log('invalid text/plain`');
        return false;
    }
    const text_plain = await val.text();
    if (start !== end) {
        editor.deleteText(s, Math.abs(start - end));
    }
    editor.insertText(text_plain, s);
    selection.setCursor(s + text_plain.length, false);
}

/**
 * @description 封装html数据
 */
function encode_html(identity: string, data: any, text?: string): string {
    // encodeURIComponent 确保转义正确
    // btoa 作为html标签的属性，不可以有一些干扰字符，采用base64封装干扰字符
    const buffer = btoa(`${identity}${encodeURIComponent(JSON.stringify(data))}`);

    return `<meta charset="utf-8"><div id="carrier" data-buffer="${buffer}">${text || ""}</div>`;
}

/**
 * @description 读取html内部数据
 * @param html
 * @returns
 */
export function decode_html(html: string): string {
    let result: any = '';
    const d = document.createElement('div');
    document.body.appendChild(d);
    d.innerHTML = html;
    const carrier = d.querySelector('#carrier');
    result = (carrier as HTMLDivElement)?.dataset?.buffer;
    result = decodeURIComponent(atob(result || ''));
    document.body.removeChild(d);
    return result;
}

/**
 * @description 从剪切板拿出图形数据并插入文档
 * @param data 剪切板拿出的数据
 * @param xy 插入位置, 没有插入位置时将分配一个位置
 */
async function clipboard_text_html(context: Context, data: any, xy?: PageXY) {
    try {
        // 解析data
        const val = await data.getType('text/html');

        if (!val) throw new Error('invalid value');

        let text_html = await val.text();
        text_html = decode_html(text_html);

        if (!(text_html && typeof text_html === 'string')) throw new Error('read failure');

        handle_text_html_string(context, text_html, xy);
    } catch (error) {
        console.log(error);
        message('info', context.workspace.t('clipboard.invalid_data'));
    }
}

function handle_text_html_string(context: Context, text_html: string, xy?: PageXY) {
    const is_paras = text_html.slice(0, 70).indexOf(paras) > -1; // 文本段落
    const is_shape = text_html.slice(0, 60).indexOf(identity) > -1; // 图形

    if (is_paras) {
        // 文字段落
        const source = JSON.parse(text_html.split(paras)[1]);
        const t_s = import_text(context.data, source, true);
        if (!t_s) throw new Error('invalid paras');
        const page = context.selection.selectedPage!;
        const shape: TextShape = (t_s as TextShape);
        const layout = shape.getLayout();
        shape.size.width = layout.contentWidth;
        shape.size.height = layout.contentHeight;
        const _f = shape.size;
        const _xy = adjust_content_xy(context, { width: _f.width, height: _f.height });
        const transform = new TransformRaw();
        transform.translateX = xy?.x || _xy.x;
        transform.translateY = xy?.y || _xy.y
        shape.transform = transform;
        const editor = context.editor4Page(page);
        const r = editor.insert(page.data, page.childs.length, shape, true);

        context.nextTick(page, () => {
            if (r) context.selection.selectShape(page.shapes.get(r.id));
        })
    } else if (is_shape) {
        // 1. 解析剪切板中的Shape
        const data = JSON.parse(text_html.split(identity)[1]);

        const source = data.shapes;
        if (!source) throw new Error('invalid source');

        const originTransform: any = data.originTransform; // 原环境下transform信息

        const page = context.selection.selectedPage!;

        const page_data = adapt2Shape(page) as Page;

        let insert_result: { shapes: Shape[] } | false = false;

        // 2. 计算插入环境和位置（存在选区环境并满足插入其中的条件的情况下，需要在后续根据指定的插入环境多次计算位置）
        const selection_envs = get_envs_from_selection(context);
        const is_exist_selection_envs = !!selection_envs.length;


        // 3. 初始化多媒体资源Container
        const medias = data.media;

        // 4. 插入文档
        const editor = context.editor4Page(page);
        if (xy) {
            const insert_env = fixToXY(context, source, xy);

            const shapes = import_shape_from_clipboard(context.data, page_data, source, medias);
            if (!shapes.length) {
                throw new Error('invalid source: !shapes.length');
            }

            insert_result = editor.pasteShapes1(adapt2Shape(insert_env) as GroupShape, shapes);

            if (!insert_result) return false;
        } else if (is_exist_selection_envs) {
            const actions: { env: GroupShape, shapes: Shape[] }[] = [];

            for (let i = 0; i < selection_envs.length; i++) {
                const __source = JSON.parse(JSON.stringify(source)); // 保证每个环境各自一份

                const env = selection_envs[i];

                fixToEnv(context, __source, env, originTransform);

                const shapes = i > 0
                    ? import_shape_from_clipboard(context.data, page_data, __source)
                    : import_shape_from_clipboard(context.data, page_data, __source, medias);

                actions.push({ env: adapt2Shape(env) as GroupShape, shapes });
            }

            const __res = editor.pasteShapes3(actions);

            if (__res) insert_result = { shapes: __res };
        } else {
            const bounding = sourceBounding(source);
            const insert_env = get_env_by_xy(context, { x: bounding.left, y: bounding.top });

            fixToEnv(context, source, insert_env as GroupShapeView, originTransform);

            const shapes = import_shape_from_clipboard(context.data, page_data, source, medias);

            if (!shapes.length) throw new Error('invalid source: !shapes.length');

            insert_result = editor.pasteShapes1(adapt2Shape(insert_env) as GroupShape, shapes);

            if (!insert_result) return false;
        }

        // 5. 上传图层内嵌的静态资源到服务端
        if (insert_result && insert_result.shapes) {
            const keys = Object.keys(medias);
            const assets: UploadAssets[] = [];
            for (const ref of keys) {
                const buff = medias[ref]?.buff;
                buff && assets.push({ ref, buff });
            }
            const uploadPackages = insert_result.shapes.map(shape => ({ shape, upload: assets }));
            const loader = new ImageLoader(context);
            loader.upload(uploadPackages);
        }

        // 6. 根据插入结果构建新的选区
        context.nextTick(page, () => {
            if (insert_result) {
                const selects: ShapeView[] = [];
                insert_result.shapes.forEach((s) => {
                    const v = page.shapes.get(s.id);
                    if (v) selects.push(v);
                })
                selects.length && context.selection.rangeSelectShape(selects);
                is_exist_selection_envs && scrollTo(context, selects);
            }
        });
    } else {
        console.log('handle_text_html_string:', context.workspace.t('clipboard.invalid_data'));
        return false;
    }

    return true;
}

async function get_html_from_datatransferitem(data: any) {
    const val = await data.getType('text/html');
    if (!val) throw new Error('invalid value');

    return await val.text();
}

function replace_action(context: Context, text_html: any, src: ShapeView[]) {
    text_html = decode_html(text_html);

    if (!(text_html && typeof text_html === 'string')) throw new Error('read failure');

    const is_shape = text_html.slice(0, 60).indexOf(identity) > -1;
    if (!is_shape) throw new Error('no shapes');

    const page = context.selection.selectedPage!;

    const source = JSON.parse(text_html.split(identity)[1]);

    const shapes = import_shape_from_clipboard(context.data, page.data, source.shapes, source.media);
    if (!shapes.length) throw new Error('invalid source');


    const editor = context.editor4Page(page);
    const r = editor.replace(context.data, shapes, src.map((s) => adapt2Shape(s)));
    if (!r || !r.length) return;

    // 上传静态资源
    const keys = Object.keys(source.media);
    const assets: UploadAssets[] = [];
    for (const ref of keys) {
        const buff = source.media[ref]?.buff;
        buff && assets.push({ ref, buff });
    }
    const uploadPackages = r.map(shape => ({ shape, upload: assets }));
    const loader = new ImageLoader(context);
    loader.upload(uploadPackages);

    context.nextTick(page, () => {
        if (r) {
            const selects: ShapeView[] = [];
            r.forEach((s) => {
                const v = page.shapes.get(s.id);
                if (v) selects.push(v);
            })
            context.selection.rangeSelectShape(selects);
        }
    })
}

/**
 * @description 从剪切板拿出图形数据并替换掉src中的内容
 * @param data 剪切板拿出的数据
 * @param src 将被替换的内容
 */
async function clipboard_text_html_replace(context: Context, data: any, src: ShapeView[]) {
    try {
        const text_html = await get_html_from_datatransferitem(data);
        replace_action(context, text_html, src);
    } catch (error) {
        console.log(error);
        message('info', context.workspace.t('system.replace_failed'));
    }
}

/**
 * 从剪切板上拿出一张图片，并插入文档
 * @param data 剪切板上的图片资源
 * @param _xy 插入位置
 */
async function clipboard_image(context: Context, data: any, t: Function, _xy?: PageXY) {
    // @ts-ignore
    if (navigator.clipboard && navigator.clipboard.read) {
        const type = data.types[0];
        const val = await data.getType(type);
        const loader = new ImageLoader(context);
        loader.insertImageByPackages([val] as unknown as FileList, true, _xy);
    } else {
        const val = data[0].getAsFile();
        const loader = new ImageLoader(context);
        loader.insertImageByPackages([val] as unknown as FileList, true, _xy);
    }
}

function image_reader(context: Context, val: any, contentType: string, t: Function, _xy?: PageXY) {
    if (contentType === "image/svg+xml") {
        return SVGReader(context, val, _xy);
    }
    const item: SystemClipboardItem = { type: ShapeType.Image, contentType, content: '' };
    const frame: { width: number, height: number } = { width: 100, height: 100 };
    const img = new Image();
    img.onload = function () {
        frame.width = img.width;
        frame.height = img.height;
        const origin = { width: img.width, height: img.height }
        const fr = new FileReader();
        fr.onload = function (event) {
            const base64: any = event.target?.result;
            if (base64) {
                fr.onload = function (event) {
                    const buff = event.target?.result;
                    if (base64 && buff) {
                        item.content = { name: t('shape.image'), frame, buff: new Uint8Array(buff as any), base64 };
                        const content = item!.content as Media;
                        const __xy = adjust_content_xy(context, content.frame);
                        const xy: PageXY = _xy || __xy;
                        paster_image(context, xy, t, content, origin);
                    }
                }
                fr.readAsArrayBuffer(val);
            }
        }
        fr.readAsDataURL(val);
    }
    img.src = URL.createObjectURL(val);
}

function maySvgText(content: string) {
    if (content.length < 11) {
        return false;
    }

    return (content.search(/<svg|<?xml/img) > -1) && (new RegExp('</svg>', "img").test(content.slice(content.length - 10).toLowerCase()));
}

/**
 * 从剪切板上拿出一段文字，并插入文档
 * @param data 剪切板上的文字资源
 * @param _xy 插入位置
 */
async function clipboard_text_plain(context: Context, data: any, _xy?: PageXY) {
    try {
        const val = await data.getType('text/plain');
        if (!val) throw new Error('invalid value');
        const text = await val.text();
        const is_plain = text && typeof text === 'string';
        if (!is_plain) throw new Error('read failure');

        if (maySvgText(text)) {
            return handleSvgText(context, text, _xy);
        }

        const frame: { width: number, height: number } = { width: 400, height: 100 };
        const __xy = adjust_content_xy(context, frame);
        const xy: PageXY = _xy || __xy;
        paster_text(context, xy, text);
    } catch (error) {
        console.log(error);
        message('info', context.workspace.t('clipboard.invalid_data'));
    }
}

function clipboard_text_plain2(context: Context, data: string, _xy?: PageXY) {
    if (maySvgText(data)) {
        return handleSvgText(context, data, _xy);
    }

    const frame: { width: number, height: number } = { width: 400, height: 100 };
    const __xy = adjust_content_xy(context, frame);
    const xy: PageXY = _xy || __xy;
    paster_text(context, xy, data);
}

export function handleSvgText(context: Context, text: string, _xy?: PageXY) {
    const parseResult = SVGParse(text);

    if (parseResult.shape) {
        const xy = _xy || adjust_content_xy(context, parseResult.shape.frame, false);
        parseResult.shape.transform.translateX = xy.x;
        parseResult.shape.transform.translateY = xy.y;
        const page = context.selection.selectedPage!;
        const editor = context.editor4Page(page);
        const shape = editor.insert(adapt2Shape(page) as GroupShape, page.childs.length, parseResult.shape);

        if (parseResult.mediaResourceMgr && shape) {
            const upload: UploadAssets[] = [];
            parseResult.mediaResourceMgr.forEach((v, k) => {
                upload.push({ ref: k, buff: v.buff });
            })
            const loader = new ImageLoader(context);
            loader.upload([{ shape, upload }]);
        }
    }
}

/**
 * 调整插入数据的位置以及大小，让插入的数据不会超过可视区域的大小并居中
 * @returns { {x: number,y: number} } 位置
 */
export function adjust_content_xy(context: Context, m: { width: number, height: number }, fixFrame = true) {
    const workspace = context.workspace;
    const root = workspace.root;
    const matrix = workspace.matrix;

    if (fixFrame) {
        const ratio_wh = m.width / m.height;
        const page_height = root.height / matrix.m00, page_width = root.width / matrix.m00;
        if (m.height >= m.width) {
            if (m.height > page_height * 0.95) {
                m.height = page_height * 0.95;
                m.width = m.height * ratio_wh;
            }
        } else {
            if (m.width > page_width * 0.95) {
                m.width = page_width * 0.95;
                m.height = m.width / ratio_wh;
            }
        }
    }

    const page = context.selection.selectedPage!;
    const __m = (page.matrix2Root());
    __m.multiAtLeft(matrix);
    const page_center = __m.inverseCoord(root.center);
    return { x: page_center.x - m.width / 2, y: page_center.y - m.height / 2 };
}

/**
 * @deprecated
 */
export function paster_image(context: Context, mousedownOnPageXY: PageXY, t: Function, media: Media, origin: {
    width: number,
    height: number
}) {
    // const selection = context.selection;
    // const workspace = context.workspace;
    // const page = selection.selectedPage;
    // const parent = selection.selectedPage;
    // let asyncCreator: AsyncCreator | undefined;
    // let new_shape: Shape | undefined;
    // const frame = new ShapeFrame(mousedownOnPageXY.x, mousedownOnPageXY.y, 100, 100);
    // if (page && parent) {
    //     const editor = context.editor.controller();
    //     const name = getName(ShapeType.Image, parent.childs, t);
    //     asyncCreator = editor.asyncCreator(mousedownOnPageXY);
    //     frame.height = media.frame.height;
    //     frame.width = media.frame.width;
    //     new_shape = asyncCreator.init_media(page.data, (parent.data), name, frame, media, origin);
    // }
    // if (asyncCreator && new_shape) {
    //     asyncCreator.close();
    //     page && context.nextTick(page, () => {
    //         new_shape && selection.selectShape(page.shapes.get(new_shape.id));
    //     })
    //     const fills = new_shape.style.getFills();
    //     context.net?.upload(fills[0].imageRef || '', media.buff.buffer.slice(0));
    // }
    // context.tool.setAction(Action.AutoV);
    // workspace.creating(false);
}

/**
 * @deprecated
 */
function paster_text(context: Context, mousedownOnPageXY: PageXY, content: string) {
    // const selection = context.selection;
    // const workspace = context.workspace;
    // const page = selection.selectedPage;
    // const parent = selection.selectedPage;
    // let asyncCreator: AsyncCreator | undefined;
    // let new_shape: Shape | undefined;
    // const frame = new ShapeFrame(mousedownOnPageXY.x, mousedownOnPageXY.y, 400, 40);
    // if (page && parent) {
    //     const editor = context.editor.controller();
    //     asyncCreator = editor.asyncCreator(mousedownOnPageXY);
    //
    //     new_shape = asyncCreator.init_text(page.data, parent.data, frame, content);
    // }
    // if (asyncCreator && new_shape) {
    //     asyncCreator = asyncCreator.close();
    //     page && context.nextTick(page, () => {
    //         new_shape && selection.selectShape(page.shapes.get(new_shape.id));
    //     })
    // }
    // context.tool.setAction(Action.AutoV);
    // workspace.creating(false);
}

/***
 *
 * 复制页面链接
 */
//复制分享链接
export const copyLink = async (url: string, t: Function) => {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(url).then(() => {
            ElMessage({
                message: `${t('share.copy_success')}`,
                type: 'success',
            })
        }, () => {
            ElMessage({
                message: `${t('share.copy_failure')}`,
                type: 'success',
            })
        })
    } else {
        const textArea = document.createElement('textarea')
        textArea.value = url
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        ElMessage({
            message: `${t('share.copy_success')}`,
            type: 'success',
        })
        textArea.remove()
    }
}

function is_html(items: DataTransferItemList) {
    return items.length === 1 && items[0].type === 'text/html';
}

function is_plain(items: DataTransferItemList) {
    if (items.length === 1 && items[0].type === 'text/plain') {
        return true;
    }

    for (let i = 0; i < items.length; i++) {
        if (items[i].type === 'text/plain') {
            return true;
        }
    }

    return false;
}

function get_image(items: DataTransferItemList) {
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            return items[i];
        }
    }

    return;
}

function get_html(items: DataTransferItemList) {
    for (let i = 0; i < items.length; i++) {
        if (items[i].type === 'text/html') {
            return items[i];
        }
    }

    return;
}

function get_plain(items: DataTransferItemList) {
    for (let i = 0; i < items.length; i++) {
        if (items[i].type === 'text/plain') {
            return items[i];
        }
    }

    return;
}

function get_env_by_xy(context: Context, xy: XY) {
    const layers_on_xy = context.selection.getLayers(xy);
    for (let i = 0; i < layers_on_xy.length; i++) {
        const s = layers_on_xy[i];
        if (s.isVirtualShape) continue;
        if (![ShapeType.Artboard, ShapeType.Group].includes(s.type)) { // 暂时只支持容器和编组
            continue;
        }

        const t = s.matrix2Root()
        if (Math.abs(t.translateX - xy.x) < 0.001 && Math.abs(t.translateY - xy.y) < 0.01) continue;

        return s;
    }
    return context.selection.selectedPage!;
}

export function get_envs_from_selection(context: Context) {
    const shapes = context.selection.selectedShapes;
    const envs: GroupShapeView[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const s = shapes[i];
        if (s.isVirtualShape) continue;
        if (context.workspace.clipboard.envs.has(s.id)) continue;
        if ([ShapeType.Artboard, ShapeType.Group].includes(s.type)) { // 暂时只支持容器和编组
            envs.push(s as GroupShapeView);
        } else {
            let p = s.parent;
            while (p) {
                if ([ShapeType.Artboard, ShapeType.Group].includes(p.type)) break;
                p = p.parent;
            }
            if (p && [ShapeType.Artboard, ShapeType.Group].includes(p.type)) envs.push(p as GroupShapeView);
        }
    }
    return envs;
}

function getHtmlAsync(data: DataTransferItem): Promise<string> {
    return new Promise((resolve, reject) => {
        data.getAsString(val => resolve(decode_html(val)));
    });
}

function getTextAsync(data: DataTransferItem): Promise<string> {
    return new Promise((resolve, reject) => {
        data.getAsString(val => resolve(val));
    });
}

function sourceBounding(source: Shape[]) {
    let left = Infinity;
    let top = Infinity;
    let right = -Infinity;
    let bottom = -Infinity;

    for (let i = 0; i < source.length; i++) {
        const shape = source[i];
        const __transform = makeShapeTransform2By1(shape.transform);
        let width, height;
        if (shape.type === ShapeType.Group || shape.type === ShapeType.BoolShape) {
            const children = (shape as GroupShape).childs;
            const __box = sourceBounding(children);
            width = __box.right - __box.left;
            height = __box.bottom - __box.top;
        } else {
            width = shape.size.width;
            height = shape.size.height;
        }
        const { col0, col1, col2, col3 } = __transform.transform([
            ColVector3D.FromXY(0, 0),
            ColVector3D.FromXY(width, height),
            ColVector3D.FromXY(width, 0),
            ColVector3D.FromXY(0, height),
        ]);
        const box = XYsBounding([col0, col1, col2, col3]);

        if (box.top < top) top = box.top;
        if (box.left < left) left = box.left;
        if (box.right > right) right = box.right;
        if (box.bottom > bottom) bottom = box.bottom;
    }

    return { left, top, right, bottom };
}

function sourceOriginTransformBounding(source: Shape[], originTransform: any) {
    let left = Infinity;
    let top = Infinity;
    let right = -Infinity;
    let bottom = -Infinity;

    for (let i = 0; i < source.length; i++) {
        const shape = source[i];
        const _t = originTransform[`${shape.id}`];
        if (!_t) continue;
        const __transform = makeShapeTransform2By1(_t);
        let width, height;
        if (shape.type === ShapeType.Group) {
            const children = (shape as GroupShape).childs;
            const __box = sourceBounding(children);
            width = __box.right - __box.left;
            height = __box.bottom - __box.top;
        } else {
            width = shape.size.width;
            height = shape.size.height;
        }
        const { col0, col1, col2, col3 } = __transform.transform([
            ColVector3D.FromXY(0, 0),
            ColVector3D.FromXY(width, height),
            ColVector3D.FromXY(width, 0),
            ColVector3D.FromXY(0, height),
        ]);
        const box = XYsBounding([col0, col1, col2, col3]);

        if (box.top < top) top = box.top;
        if (box.left < left) left = box.left;
        if (box.right > right) right = box.right;
        if (box.bottom > bottom) bottom = box.bottom;
    }

    return { left, top, right, bottom };
}

function fixToEnv(context: Context, source: Shape[], env: GroupShapeView, originTransform: any) {
    const { left, top, right, bottom } = sourceBounding(source); // 目标选区在Root坐标系上的Bounding

    let clientMatrix = makeShapeTransform2By1(context.workspace.matrix); // Root到屏幕的转换矩阵

    const { col0: clientLT, col1: clientRB } = clientMatrix.transform([
        ColVector3D.FromXY(left, top),
        ColVector3D.FromXY(right, bottom)
    ]); // 目标选区在屏幕上的左上角和右下角；

    if (env.type === ShapeType.Page) { // 将粘贴在Root下
        const root = context.workspace.root;

        const inner = clientLT.x >= 0
            && clientLT.y >= 0
            && clientRB.x <= root.width
            && clientRB.y <= root.height;

        if (inner) {
            // console.log('将粘贴到ROOT下，并原位粘贴');
            // 没有逃离屏幕可视区域，原位粘贴
            for (const shape of source) {
                const t = (shape.transform.clone());
                t.multi(env.matrix2Root().getInverse());

                shape.transform = (t);
            }
        } else {
            // 逃离了屏幕可视区域，尝试居中
            // console.log('将粘贴到ROOT下，但选区将溢出屏幕，尝试相对屏幕居中，并调整选区');

            // 检查是否需要调整视图缩放比例
            const { width, height } = context.workspace.root;
            const { col0, col1 } = clientMatrix.clone().getInverse().transform([
                ColVector3D.FromXY(0, 0),
                ColVector3D.FromXY(width, height)
            ]);

            const containWidth = col1.x - col0.x;
            const containHeight = col1.y - col0.y;

            // 如果ratioW大与1，则说明当前缩放比例下，整体宽度不足以容纳目标选区的宽度；
            const ratioW = (right - left) / (containWidth * 0.92);
            const ratioH = (bottom - top) / (containHeight * 0.92); // 不取1是为了周边留点空白；

            const matrix = context.workspace.matrix;
            if (ratioW > 1 || ratioH > 1) { // 调整视图比例
                // console.log('将以屏幕中点为中心，进行缩放');
                matrix.trans(-width / 2, -height / 2);
                matrix.scale(1 / Math.max(ratioW, ratioH));
                matrix.trans(width / 2, height / 2);

                clientMatrix = makeShapeTransform2By1(context.workspace.matrix);
                context.workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
            }

            const centerAfterScale = clientMatrix.clone()
                .getInverse()
                .transform(ColVector3D.FromXY(width / 2, height / 2)).col0;

            const dx = centerAfterScale.x - (right + left) / 2;
            const dy = centerAfterScale.y - (bottom + top) / 2;

            const selectionTransform = new TransformRaw().trans(dx, dy);

            // at last 调整选区内每个图层的位置
            for (const shape of source) {
                const t = (shape.transform)
                    .clone()
                    .multi(selectionTransform)
                    .multi(env.matrix2Root().getInverse());

                shape.transform = (t);
            }
        }
    } else { // 将粘贴在指定的容器下
        // console.log('计划在对等位将目标选区粘贴在目标容器中，若脱离则调整对应轴至居中');
        const { x: envX, y: envY, width: envWidth, height: envHeight } = env.frame;

        const env2root = env.matrix2Root();
        const envBound = XYsBounding(env2root.transform([
            ColVector3D.FromXY(envX, envY),
            ColVector3D.FromXY(envX + envWidth, envY),
            ColVector3D.FromXY(envX + envWidth, envY + envHeight),
            ColVector3D.FromXY(envX, envY + envHeight),
        ]));

        const envBoundWidth = envBound.right - envBound.left;
        const envBoundHeight = envBound.bottom - envBound.top;

        const sourceOriginBound = sourceOriginTransformBounding(source, originTransform);

        const targetSelectionTransform = new Transform();

        if (sourceOriginBound.left > envBoundWidth || sourceOriginBound.right < 0) {
            const shapeCX = (sourceOriginBound.left + sourceOriginBound.right) / 2;
            targetSelectionTransform.translate(ColVector3D.FromXY(envBoundWidth / 2 - shapeCX, 0));
        }
        if (sourceOriginBound.top > envBoundHeight || sourceOriginBound.bottom < 0) {
            const shapeCY = (sourceOriginBound.top + sourceOriginBound.bottom) / 2;
            targetSelectionTransform.translate(ColVector3D.FromXY(0, envBoundHeight / 2 - shapeCY));
        }

        for (const shape of source) {
            const _t = originTransform[`${shape.id}`];
            if (!_t) continue;

            const __transform = makeShapeTransform2By1(_t)
                .addTransform(targetSelectionTransform);

            shape.transform = makeShapeTransform1By2(__transform) as TransformRaw;
        }
    }

    return { left, top };
}

function fixToXY(context: Context, source: Shape[], xy: XY) {
    const env = get_env_by_xy(context, xy);

    const bounding = sourceBounding(source);
    const dx = xy.x - bounding.left;
    const dy = xy.y - bounding.top;
    const selectionTransform = new TransformRaw().trans(dx, dy);

    for (const shape of source) {
        shape.transform = TransformRaw.from(shape.transform)
            .multi(selectionTransform)
            .multi(env.matrix2Root().getInverse());
    }

    return env;
}

function scrollTo(context: Context, views: ShapeView[], options?: { center?: boolean, smooth?: boolean }) {
    const center = options?.center === undefined ? true : options.center;
    const smooth = options?.smooth === undefined ? true : options.smooth;

    const matrix = context.workspace.matrix;

    let left = Infinity;
    let right = -Infinity;
    let top = Infinity;
    let bottom = -Infinity;
    for (const view of views) {
        const matrix2Client = view.matrix2Root();
        matrix2Client.multiAtLeft(matrix);
        const { x, y, width, height } = view.frame;
        const points = [{ x, y }, { x: x + width, y }, { x: x + width, y: height }, { x, y: height + y }]
            .map(p => matrix2Client.computeCoord3(p));
        const box = XYsBounding(points);
        if (box.left < left) left = box.left;
        if (box.right > right) right = box.right;
        if (box.top < top) top = box.top;
        if (box.bottom > bottom) bottom = box.bottom;
    }

    const height = bottom - top;
    const width = right - left;

    const root = context.workspace.root;

    const needTrans = left > root.right || top > root.bottom || right < root.x || bottom < root.y;
    const needScale = width > root.width || height > root.height;

    if (needTrans) {
        if (center) {
            const boxCenter = { x: (left + right) / 2, y: (top + bottom) / 2 };
            const rootCenter = root.center;
            const dx = boxCenter.x - rootCenter.x;
            const dy = boxCenter.y - rootCenter.y;
            new StyleManager(context).smoothScroll(() => {
                matrix.trans(-dx, -dy);
                context.workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
            });
        }
    }
}