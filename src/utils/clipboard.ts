import {
    export_shape, import_shape_from_clipboard,
    Shape, ShapeType, AsyncCreator, ShapeFrame, GroupShape, TextShape, Text,
    export_text, import_text, TextShapeEditor, ImageShape, transform_data, ContactShape, CurvePoint, PathShape, adapt2Shape, ShapeView, TableCellType, TableShape, Matrix
} from '@kcdesign/data';
import { Context } from '@/context';
import { PageXY, XY } from '@/context/selection';
import { Media, getName, upload_image } from '@/utils/content';
import { message } from './message';
import { Action } from '@/context/tool';
import { XYsBounding, is_box_outer_view2 } from './common';
import { compare_layer_3 } from './group_ungroup';
import { Document } from '@kcdesign/data';
import { v4 } from 'uuid';
import { AsyncTransfer } from "@kcdesign/data";
import { ElMessage } from 'element-plus';

interface SystemClipboardItem {
    type: ShapeType
    contentType: string
    content: Media | string
}
class ExfContext {
    symbols = new Set<string>()
    medias = new Set<string>()
    referenced = new Set<string>()
}
type CacheType = 'inner-html' | 'plain-text' | 'double' | 'image';
export const identity = 'cn.protodesign';
export const paras = 'cn.protodesign/paras'; // 文字段落
export class Clipboard {
    private context: Context;
    private cache: { type: CacheType, data: any } | undefined;

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

        if (!event) {
            return is_async_plan_enable;
        }

        if (!event.clipboardData) {
            return false;
        }

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

        // 记录每个图形相对root位置
        const position_map: Map<string, PageXY> = new Map();
        const points_map: Map<string, CurvePoint[]> = new Map();
        for (let i = 0, len = shapes.length; i < len; i++) {
            const shape = shapes[i];
            position_map.set(shape.id, shape.matrix2Root().computeCoord2(0, 0));
            if (shape instanceof ContactShape) {
                points_map.set(shape.id, shape.getPoints());
            }
        }

        // 先导出将要写入的数据
        const { shapes: _shapes, ctx } = export_shape(shapes.map((s => adapt2Shape(s))));
        if (!_shapes) {
            return false;
        }

        // 修改写入数据的frame，使之在多选的情况下每个图形之间的相对位置不变
        for (let i = 0, len = _shapes.length; i < len; i++) {
            const shape = _shapes[i];
            const root_frame = position_map.get(shape.id);
            if (root_frame) {
                shape.frame.x = root_frame.x;
                shape.frame.y = root_frame.y;
            }

            const points = points_map.get(shape.id);
            if (points) {
                (shape as PathShape).points = points.map(i => new CurvePoint(v4(), i.x, i.y, i.mode)) as any;
            }
        }

        const media = sort_media(this.context.data, ctx);
        const data = {
            shapes: _shapes,
            media
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

    cut(event: ClipboardEvent) {
        try {
            const res = this.write(event);
            if (!res) {
                return;
            }

            const textshape = this.context.selection.textshape;
            const text = this.text;

            if (text && textshape) {
                const selection = this.context.textSelection;
                const start = selection.cursorStart;
                const end = selection.cursorEnd;
                if (start === end) {
                    return;
                }

                const editor = this.context.editor4TextShape(textshape);

                if (editor.deleteText(Math.min(start, end), Math.abs(start - end))) {
                    selection.setCursor(Math.min(start, end), false);
                }
                return;
            }

            const table = this.context.selection.tableshape;
            if (text && table) {
                const editor = this.context.editor4Table(table as TableShape);
                const ts = this.context.tableSelection;
                editor.resetTextCells(ts.tableRowStart, ts.tableRowEnd, ts.tableColStart, ts.tableColEnd);
                ts.resetSelection();
                return;
            }

            const page = this.context.selection.selectedPage;
            if (!page) {
                return;
            }

            const editor = this.context.editor4Page(page);
            const delete_res = editor.delete_batch(this.context.selection.selectedShapes.map(s => adapt2Shape(s)));

            if (delete_res) {
                this.context.selection.resetSelectShapes();
            }
        } catch (error) {
            return;
        }
    }

    async paste(t: Function, event?: ClipboardEvent, xy?: PageXY) {
        try {
            if (!event) { // 粘贴由鼠标事件触发，只能去读取 '异步剪切板'
                return this.paste_async(t, xy);
            }

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
            if (!navigator.clipboard?.read) {
                throw new Error('Not support.');
            }
            const data = await navigator.clipboard.read();
            if (!data) {
                throw new Error('No valid data on clipboard.');
            }

            this.paste_clipboard_items(data, t, xy);
        } catch (error) {
            console.log('paste_async error:', error);
            this.paste_cache(t, xy);
        }
    }

    paste_datatransfer_item_list(data: DataTransferItemList, t: Function, xy?: PageXY) {
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

        const type = (function () {
            const types = d.types; // 剪切板内的数据类型
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

    paste_cache(t: Function, xy?: PageXY) {
        if (!this.cache) {
            return;
        }

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
    }

    paste_cache_for_text() {
        if (!this.cache) {
            return;
        }

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
        ) {
            return;
        }

        let plain;
        if (type === 'plain-text') {
            plain = data;
        } else if (type === 'double') {
            plain = decode_html(data['text/plain']);
        }

        if (!plain) {
            return;
        }

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
            }
            else if (types.length === 2) {
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

        if (!this.cache) {
            return '';
        }

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
            if (!src.length) {
                throw new Error('null data');
            }

            if (!navigator.clipboard.read) {
                return this.replace_sync(src);
            }
            const data = await navigator.clipboard.read();
            if (!(data && data.length)) {
                throw new Error('invalid data');
            }
            const is_inner_shape = data[0].types.length === 1 && data[0].types[0] === 'text/html';
            if (!is_inner_shape) {
                throw new Error('external data');
            }
            clipboard_text_html_replace(this.context, data[0], src);
            return true;
        } catch (error) {
            console.log('replace error:', error);
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
}

/**
 * @description 只存base64到剪切板
 */
function sort_media(document: Document, exportCtx: ExfContext) {
    const media: any = {};
    exportCtx.medias.forEach(v => {
        const res = document.mediasMgr.getSync(v)?.base64;
        if (!res) {
            return;
        }
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
 * @param { string } identity 封装类型，分为段落、图层
 * @param { text } 如果为段落，会另存一份纯文本
 */
function encode_html(identity: string, data: any, text?: string): string {
    // encodeURIComponent 确保转义正确
    // btoa 作为html标签的属性，不可以有一些干扰字符，采用base64封装干扰字符
    const buffer = btoa(`${identity}${encodeURIComponent(JSON.stringify(data))}`);

    const html = `<meta charset="utf-8"><div id="carrier" data-buffer="${buffer}">${text || ""}</div>`;

    return html;
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

export function after_import(context: Context, media: any) {
    if (!media || !(media instanceof Object)) {
        console.log('!media || !(media instanceof Object)');
        return;
    }

    const values = Array.from(Object.keys(media) || []) as string[];

    if (!values?.length) {
        return;
    }

    let index = 0;
    exe(index);

    async function exe(index: number) {
        const key = values[index];

        if (!key) {
            console.log('!key');
            return;
        }

        const buff = media[key].buff;

        if (!(buff instanceof Uint8Array)) {
            console.log('!(buff instanceof Uint8Array)');
            return;
        }

        await upload_image(context, key, buff);
        index++;

        if (index >= values.length) {
            return;
        }
        exe(index);
    }
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

        if (!val) {
            throw new Error('invalid value');
        }

        let text_html = await val.text();
        text_html = decode_html(text_html);

        if (!(text_html && typeof text_html === 'string')) {
            throw new Error('read failure');
        }

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

        if (!t_s) {
            throw new Error('invalid paras');
        }

        const page = context.selection.selectedPage;
        if (!page) {
            throw new Error('outside page');
        }

        const shape: TextShape = (t_s as TextShape);
        const layout = shape.getLayout();
        shape.frame.width = layout.contentWidth;
        shape.frame.height = layout.contentHeight;
        const _f = shape.frame;
        const _xy = adjust_content_xy(context, { width: _f.width, height: _f.height });
        shape.frame.x = xy?.x || _xy.x;
        shape.frame.y = xy?.y || _xy.y;
        const editor = context.editor4Page(page);
        const r = editor.insert(page.data, page.childs.length, shape);

        context.nextTick(page, () => {
            if (r) context.selection.selectShape(page.shapes.get(r.id));
        })
    } else if (is_shape) {
        // 1. 解析剪切板中的图层
        const data = JSON.parse(text_html.split(identity)[1]);

        const source = data?.shapes;
        if (!source) {
            throw new Error('invalid source');
        }

        const page = context.selection.selectedPage;
        if (!page) {
            return;
        }

        // 2. 计算插入环境和位置（在有选中容器的情况下，需要根据指定的插入环境多次计算位置）
        let insert_env: Shape = page.data;
        if (xy) {
            modify_frame_by_xy(xy, source); // 以新的起点为基准，重新计算每个图形位置
            insert_env = get_env_by_xy(context, xy);
        } else if (is_box_outer_view2(source, context)) { // 粘贴进入文档的图形将脱离视野，需要重新寻找新的定位
            const box = get_source_box(source);
            const wpc = context.workspace.center_on_page;
            box.x = wpc.x - box.width / 2;
            box.y = wpc.y - box.height / 2;
            modify_frame_by_xy(box, source);
            insert_env = get_env_by_box(context, box);
        }

        // 3. 将图层导入文档（还未插入文档）
        const medias = data?.media;
        const shapes = import_shape_from_clipboard(context.data, source, medias);
        if (!shapes.length) {
            throw new Error('invalid source: !shapes.length');
        }

        let insert_result: { shapes: Shape[] } | false = false;

        // 4. 插入文档
        const editor = context.editor4Page(page);
        insert_result = editor.pasteShapes1(insert_env as GroupShape, shapes);
        if (!insert_result) {
            return;
        }

        // 5. 根据插入结果构建新的选区
        context.nextTick(page, () => {
            if (insert_result) {
                const selects: ShapeView[] = [];
                insert_result.shapes.forEach((s) => {
                    const v = page.shapes.get(s.id);
                    if (v) selects.push(v);
                })
                context.selection.rangeSelectShape(selects);
            }
        })

        // 6. 上传图层内嵌的静态资源到服务端
        after_import(context, medias);
    } else {
        message('info', context.workspace.t('clipboard.invalid_data'));
    }
}

function modify_frame_by_xy(xy: PageXY, shapes: Shape[]) {
    const lt_shape_xy = { x: Infinity, y: Infinity };
    for (let i = 0, len = shapes.length; i < len; i++) { // 寻找图形群体的起点
        const frame = shapes[i].frame;
        if (frame.x < lt_shape_xy.x) lt_shape_xy.x = frame.x;
        if (frame.y < lt_shape_xy.y) lt_shape_xy.y = frame.y;
    }
    for (let i = 0, len = shapes.length; i < len; i++) {
        let shape = shapes[i];
        shape.frame.x += xy.x - lt_shape_xy.x, shape.frame.y += xy.y - lt_shape_xy.y;
    }
}
async function get_html_from_datatransferitem(data: any) {
    const val = await data.getType('text/html');
    if (!val) {
        throw new Error('invalid value');
    }

    return await val.text();
}
function replace_action(context: Context, text_html: any, src: ShapeView[]) {
    text_html = decode_html(text_html);

    if (!(text_html && typeof text_html === 'string')) {
        throw new Error('read failure');
    }

    const is_shape = text_html.slice(0, 60).indexOf(identity) > -1;
    if (!is_shape) {
        throw new Error('no shapes');
    }

    const source = JSON.parse(text_html.split(identity)[1]);

    const shapes = import_shape_from_clipboard(context.data, source.shapes, source.media);
    if (!shapes.length) {
        throw new Error('invalid source');
    }

    after_import(context, source.media);

    const page = context.selection.selectedPage;

    if (!page) {
        return;
    }

    const editor = context.editor4Page(page);
    const r = editor.replace(context.data, shapes, src.map((s) => adapt2Shape(s)));
    if (!r) {
        return;
    }

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
        image_reader(context, val, type, t, _xy);
    } else {
        const type = data[0].type;
        const val = data[0].getAsFile();
        image_reader(context, val, type, t, _xy);
    }
}

function image_reader(context: Context, val: any, contentType: string, t: Function, _xy?: PageXY) {
    const item: SystemClipboardItem = { type: ShapeType.Image, contentType, content: '' };
    const frame: { width: number, height: number } = { width: 100, height: 100 };
    const img = new Image();
    img.onload = function () {
        frame.width = img.width;
        frame.height = img.height;
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
                        paster_image(context, xy, t, content);
                    }
                }
                fr.readAsArrayBuffer(val);
            }
        }
        fr.readAsDataURL(val);
    }
    img.src = URL.createObjectURL(val);
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
    const frame: { width: number, height: number } = { width: 400, height: 100 };
    const __xy = adjust_content_xy(context, frame);
    const xy: PageXY = _xy || __xy;
    paster_text(context, xy, data);
}

/**
 * 调整插入数据的位置以及大小，让插入的数据不会超过可视区域的大小并居中
 * @returns { {x: number,y: number} } 位置
 */
function adjust_content_xy(context: Context, m: { width: number, height: number }) {
    const workspace = context.workspace, root = workspace.root, matrix = workspace.matrix;
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
    const page_center = matrix.inverseCoord(root.center);
    return { x: page_center.x - m.width / 2, y: page_center.y - m.height / 2 };
}

/**
 * 将图片插入文档
 */
export function paster_image(context: Context, mousedownOnPageXY: PageXY, t: Function, media: Media) {
    const selection = context.selection;
    const workspace = context.workspace;
    const page = selection.selectedPage;
    const parent = selection.selectedPage;
    let asyncCreator: AsyncCreator | undefined;
    let new_shape: Shape | undefined;
    const frame = new ShapeFrame(mousedownOnPageXY.x, mousedownOnPageXY.y, 100, 100);
    if (page && parent) {
        const editor = context.editor.controller();
        const name = getName(ShapeType.Image, parent.childs, t);
        asyncCreator = editor.asyncCreator(mousedownOnPageXY);
        frame.height = media.frame.height;
        frame.width = media.frame.width;
        new_shape = asyncCreator.init_media(page.data, (parent.data), name, frame, media);
    }
    if (asyncCreator && new_shape) {
        asyncCreator = asyncCreator.close();
        page && context.nextTick(page, () => {
            new_shape && selection.selectShape(page.shapes.get(new_shape.id));
        })
        context.communication.docResourceUpload.upload((new_shape as ImageShape).imageRef, media.buff.buffer.slice(0));
    }
    context.tool.setAction(Action.AutoV);
    workspace.creating(false);
}

/**
 * 将文字插入文档
 */
function paster_text(context: Context, mousedownOnPageXY: PageXY, content: string) {
    const selection = context.selection;
    const workspace = context.workspace;
    const page = selection.selectedPage;
    const parent = selection.selectedPage;
    let asyncCreator: AsyncCreator | undefined;
    let new_shape: Shape | undefined;
    const frame = new ShapeFrame(mousedownOnPageXY.x, mousedownOnPageXY.y, 400, 40);
    if (page && parent) {
        const editor = context.editor.controller();
        asyncCreator = editor.asyncCreator(mousedownOnPageXY);
        new_shape = asyncCreator.init_text(page.data, parent.data, frame, content);
    }
    if (asyncCreator && new_shape) {
        asyncCreator = asyncCreator.close();
        page && context.nextTick(page, () => {
            new_shape && selection.selectShape(page.shapes.get(new_shape.id));
        })
    }
    context.tool.setAction(Action.AutoV);
    workspace.creating(false);
}

// 不经过剪切板，直接复制(Shape[])
export async function paster_short(context: Context, shapes: ShapeView[], editor: AsyncTransfer): Promise<ShapeView[]> {
    const pre_shapes: Shape[] = [];
    const actions: { parent: GroupShape, index: number }[] = [];

    for (let i = 0, len = shapes.length; i < len; i++) {
        const s = shapes[i];
        let _s = s;
        let p = s.parent;
        if (!p) {
            continue;
        }

        if (p.type === ShapeType.SymbolUnion) {
            _s = p;
            p = p.parent;
        }

        if (!p) {
            continue;
        }

        const childs = p.childs;
        for (let j = 0, len2 = childs.length; j < len2; j++) {
            if (_s.id === childs[j].id) {
                pre_shapes.push(adapt2Shape(s));
                actions.push({ parent: adapt2Shape(p) as GroupShape, index: j + 1 });
                break;
            }
        }
    }

    const new_source = transform_data(context.data, pre_shapes);

    const page = context.selection.selectedPage;
    if (!page) {
        return [];
    }

    let result: Shape[] = [];

    if (new_source.length !== actions.length) {
        return [];
    }

    const _r = editor.shortPaste(new_source, actions);
    if (_r && _r.length) {
        result = _r;
    }

    if (!result.length) {
        return [];
    }

    return new Promise<ShapeView[]>((resolve, reject) => {
        if (!page) {
            resolve([]);
            return;
        }
        context.nextTick(page, () => {
            const selects: ShapeView[] = [];
            result.forEach((s) => {
                const v = page.shapes.get(s.id);
                if (v) selects.push(v);
            })
            context.selection.rangeSelectShape(selects);
            context.assist.collect();
            resolve(selects);
        })
    })
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

function get_source_box(source: Shape[]) {
    let left = Infinity;
    let top = Infinity;
    let right = -Infinity;
    let bottom = -Infinity;

    for (let i = 0; i < source.length; i++) {
        const shape = source[i];
        let f: { x: number, y: number, height: number, width: number } = { ...shape.frame };
        if (is_transform(shape)) {
            const m = get_matrix(shape);
            const rt = m.computeCoord2(f.width, 0);
            const rb = m.computeCoord2(f.width, f.height);
            const lb = m.computeCoord2(0, f.height);

            const box = XYsBounding([f, rt, rb, lb]);
            f.x = box.left;
            f.y = box.top;
            f.width = box.right - f.x;
            f.height = box.bottom - f.y;
        }

        if (left > f.x) {
            left = f.x;
        }
        if (top > f.y) {
            top = f.y;
        }
        if (right < f.x + f.width) {
            right = f.x + f.width;
        }
        if (bottom < f.y + f.height) {
            bottom = f.y + f.height;
        }
    }

    return { x: left, y: top, width: right - left, height: bottom - top };

    function is_transform(shape: Shape) {
        return shape.rotation || shape.isFlippedHorizontal || shape.isFlippedVertical;
    }

    function get_matrix(shape: Shape) {
        const f = shape.frame;
        const m = new Matrix();
        m.trans(-f.x, -f.y);
        if (shape.isFlippedHorizontal) {
            m.flipHoriz();
        }
        if (shape.isFlippedVertical) {
            m.flipVert();
        }
        if (shape.rotation) {
            m.rotate(-(shape.rotation / 180 * Math.PI));
        }

        return new Matrix(m.inverse);
    }
}

function get_env_by_box(context: Context, box: { x: number, y: number, width: number, height: number }) {
    const layers_on_xy = context.selection.getLayers(box);
    for (let i = 0; i < layers_on_xy.length; i++) {
        const s = layers_on_xy[i];
        if (s.type !== ShapeType.Artboard) { // 暂时只支持容器
            continue;
        }
        if (s.frame.width < box.width || s.frame.height < box.height) {
            continue;
        }

        return s.data;
    }
    return context.selection.selectedPage!.data;
}
function get_env_by_xy(context: Context, xy: XY) {
    const layers_on_xy = context.selection.getLayers(xy);
    for (let i = 0; i < layers_on_xy.length; i++) {
        const s = layers_on_xy[i];
        if (s.type !== ShapeType.Artboard) { // 暂时只支持容器
            continue;
        }

        return s.data;
    }
    return context.selection.selectedPage!.data;
}

function get_envs_from_selection(context: Context) {
    const shapes = context.selection.selectedShapes;
    for (let i = 0; i < shapes.length; i++) {
        
    }
}