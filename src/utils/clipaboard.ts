import {
    export_shape, import_shape,
    Shape, ShapeType, AsyncCreator, ShapeFrame, GroupShape, TextShape, Text,
    export_text, import_text, TextShapeEditor
} from '@kcdesign/data';
import { Context } from '@/context';
import { PageXY } from '@/context/selection';
import { Media, Action } from '@/context/workspace';
import { getName } from '@/utils/content';
import { message } from './message';
interface SystemClipboardItem {
    type: ShapeType
    contentType: string
    content: Media | string
}
export const identity = 'cn.protodesign/clipboard';
export const paras = 'paras';
export class Clipboard {
    private context: Context;
    constructor(context: Context) {
        this.context = context;
    }
    clipboard_write_shapes(shapes: Shape[]) {
        return export_shape(shapes);
    }
    /**
     * @description 往剪切板写入图层/文本段落数据，考虑兼容性，该方法内部应支持多种剪切板实现方案
     * @param { Text } 是否文本段落
     * @returns 
     */
    async write_html(text?: Text): Promise<boolean> {
        if (text) { // 写入文字段落
            const _text = export_text(text);
            if (!_text) return false;
            if (navigator.clipboard && ClipboardItem) {
                const blob = new Blob([`${identity}-${paras}${JSON.stringify(_text)}` || ''], { type: 'text/html' });
                const plain_text = text.getText(0, text.length);
                const blob_plain = new Blob([plain_text], { type: 'text/plain' });
                const content = [new ClipboardItem({ "text/plain": blob_plain, 'text/html': blob })];
                await navigator.clipboard.write(content);
                return true;
            } else {
                // todo plan2
                return false;
            }
        } else { // 写入图层数据
            const shapes = this.context.selection.selectedShapes;
            if (!shapes.length) return false;
            // 记录相对root位置
            const position_map: Map<string, ShapeFrame> = new Map();
            for (let i = 0; i < shapes.length; i++) {
                position_map.set(shapes[i].id, shapes[i].frame2Root());
            }
            const content = this.clipboard_write_shapes(shapes);
            if (!content) return false;
            for (let i = 0; i < content.length; i++) {
                const shape = content[i].content;
                const root_frame = position_map.get(shape.id);
                if (root_frame) shape.frame = root_frame;
            }
            if (navigator.clipboard && ClipboardItem) {
                const blob = new Blob([`${identity}${JSON.stringify(content)}` || ''], { type: 'text/html' });
                await navigator.clipboard.write([new ClipboardItem({ 'text/html': blob })]);
                return true;
            } else {
                // todo plan2
                return false;
            }
        }
    }
    async cut() {
        const res = await this.write_html();
        if (!res) return false;
        const page = this.context.selection.selectedPage;
        if (!page) return false;
        const editor = this.context.editor4Page(page);
        const delete_res = editor.delete_batch(this.context.selection.selectedShapes);
        if (delete_res) {
            this.context.selection.resetSelectShapes();
        }
        return delete_res;
    }

}
/**
 * 文本编辑状态下的粘贴
 * @param only_text 只粘贴文本
 */
export async function paster_inner_shape(context: Context, editor: TextShapeEditor, only_text?: boolean) {
    try {
        if (!navigator.clipboard) throw new Error('not supported');
        const data = await navigator.clipboard.read();
        if (!(data && data.length)) throw new Error('invalid data');
        const _d = data[0];
        const types = _d.types;
        if (types.length === 1) {
            const type = types[0];
            if (type === 'text/plain') {
                const val = await _d.getType('text/plain');
                const text = await val.text();
                if (!(text && typeof text === 'string')) throw new Error('invalid text');
                const selection = context.selection;
                const start = selection.cursorStart;
                const end = selection.cursorEnd;
                const s = Math.min(start, end);
                editor.insertText(text, s);
                selection.setCursor(s + text.length, false);
            } else if (type === 'text/html') {
                const val = await _d.getType('text/html');
                const text_html = await val.text();
                if (!(text_html && typeof text_html === 'string')) throw new Error('invalid text/html');
                if (!(text_html.slice(0, 70).indexOf(`${identity}-${paras}`) > -1)) throw new Error('wrong text/html');
                const source = JSON.parse(text_html.split(`${identity}-${paras}`)[1]);
                const text = import_text(context.data, source, false) as Text;
                const selection = context.selection;
                const start = selection.cursorStart;
                const end = selection.cursorEnd;
                const s = Math.min(start, end);
                if (only_text) {
                    const ot = text.getText(0, text.length);
                    if (start !== end) {
                        editor.deleteText(s, Math.abs(start - end));
                    }
                    editor.insertText(ot, s);
                    selection.setCursor(s + ot.length, false);
                } else {
                    editor.insertFormatText(text, s, Math.abs(start - end));
                    selection.setCursor(s + text.length, false);
                }
            }
        } else if (types.length === 2) {
            if (types.includes('text/html')) {
                const val = await _d.getType('text/html');
                const text_html = await val.text();
                if (!(text_html && typeof text_html === 'string')) throw new Error('invalid text/html');
                if (!(text_html.slice(0, 70).indexOf(`${identity}-${paras}`) > -1)) throw new Error('wrong text/html');
                const source = JSON.parse(text_html.split(`${identity}-${paras}`)[1]);
                const text = import_text(context.data, source, false) as Text;
                const selection = context.selection;
                const start = selection.cursorStart;
                const end = selection.cursorEnd;
                const s = Math.min(start, end);
                if (only_text) {
                    const ot = text.getText(0, text.length);
                    if (start !== end) {
                        editor.deleteText(s, Math.abs(start - end));
                    }
                    editor.insertText(ot, s);
                    selection.setCursor(s + ot.length, false);
                } else {
                    editor.insertFormatText(text, s, Math.abs(start - end));
                    selection.setCursor(s + text.length, false);
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
}
/**
 * @description 粘贴
 * @param xy 以xy为锚点，不存在xy时，粘贴在原来的位置
 */
export async function paster(context: Context, t: Function, xy?: PageXY) {
    try {
        if (!navigator.clipboard || !navigator.clipboard.read) {
            // todo plan2 兼容方案二
            return;
        }
        context.workspace.setFreezeStatus(true);
        const data = await navigator.clipboard.read();
        if (!data) {
            message('info', t('clipboard.invalid_data'));
            context.workspace.setFreezeStatus(false);
            return;
        }
        const d = data[0]; // 剪切板内的数据
        const types = data[0].types; // 剪切板内的数据类型
        console.log('types', types);

        if (types.length === 1) {
            const type = types[0];
            if (type === 'text/html') { // 内容为Shape[]
                clipboard_text_html(context, d, xy);
            } else if (type === 'text/plain') { // 内容为白板文本
                clipboard_text_plain(context, d, xy);
            } else if (/image/.test(type)) { // 内容为图片资源
                clipboard_image(context, d, t, xy);
            }
        } else if (types.length === 2) {
            // 如果剪切板内存在多个类型的数据，优先读取纯文本
            if (types.includes('text/plain')) {
                clipboard_text_plain(context, d, xy);
            }
            // todo
        }
        context.workspace.setFreezeStatus(false);
    } catch (error) {
        console.log(error);
        message('info', t('clipboard.invalid_data'));
        context.workspace.setFreezeStatus(false);
    }
}
/**
 * 从剪切板拿出数据替换掉src的内容，以src中每个图形的左上角为锚点
 * @returns 
 */
export async function replace(context: Context, t: Function, src: Shape[]) {
    try {
        if (!navigator.clipboard) throw new Error('not supported');
        context.workspace.setFreezeStatus(true);
        const data = await navigator.clipboard.read();
        if (!(data && data.length)) throw new Error('invalid data');
        const is_inner_shape = data[0].types.length === 1 && data[0].types[0] === 'text/html';
        if (!is_inner_shape) throw new Error('external data');
        clipboard_text_html_replace(context, data[0], src);
        context.workspace.setFreezeStatus(false);
        return true;
    } catch (error) {
        console.log(error);
        context.workspace.setFreezeStatus(false);
        message('info', t('system.replace_failed'));
        return false;
    }
}
/**
 * @description 从剪切板拿出图形数据并插入文档
 * @param data 剪切板拿出的数据
 * @param xy 插入位置
 */
async function clipboard_text_html(context: Context, data: any, xy?: PageXY) {
    try {
        const val = await data.getType('text/html');
        if (!val) throw new Error('invalid value');
        const text_html = await val.text();
        if (!(text_html && typeof text_html === 'string')) throw new Error('read failure');
        const is_paras = text_html.slice(0, 70).indexOf(`${identity}-${paras}`) > -1;
        const is_shape = text_html.slice(0, 60).indexOf(identity) > -1;
        if (is_paras) { // 文字段落
            const source = JSON.parse(text_html.split(`${identity}-${paras}`)[1]);
            const t_s = import_text(context.data, source, true);
            if (!t_s) throw new Error('invalid paras');
            const page = context.selection.selectedPage;
            if (!page) throw new Error('outside page');
            const shape: TextShape = (t_s as TextShape);
            const layout = shape.getLayout();
            shape.frame.width = layout.contentWidth;
            shape.frame.height = layout.contentHeight;
            const _f = shape.frame;
            const _xy = adjust_content_xy(context, { width: _f.width, height: _f.height });
            shape.frame.x = xy?.x || _xy.x;
            shape.frame.y = xy?.y || _xy.y;
            const editor = context.editor.editor4Page(page);
            const r = editor.insert(page, page.childs.length, shape);
            if (r) context.selection.selectShape(r);
        } else if (is_shape) { // 内部图层
            const source = JSON.parse(text_html.split(identity)[1]);
            const shapes = import_shape(context.data, source);
            const result: Shape[] = [];
            if (!shapes.length) throw new Error('invalid source');
            const lt_shape_xy = { x: shapes[0].frame.x, y: shapes[0].frame.y };
            if (xy) {
                for (let i = 0; i < shapes.length; i++) {
                    const frame = shapes[i].frame;
                    if (frame.x < lt_shape_xy.x) lt_shape_xy.x = frame.x;
                    if (frame.y < lt_shape_xy.y) lt_shape_xy.y = frame.y;
                }
            }
            const deltas = [];
            if (xy) {
                for (let i = 0; i < shapes.length; i++) {
                    const frame = shapes[i].frame;
                    deltas.push({ x: frame.x - lt_shape_xy.x, y: frame.y - lt_shape_xy.y });
                }
            }
            for (let i = 0; i < shapes.length; i++) {
                const shape = shapes[i];
                if (xy) {
                    shape.frame.x = xy.x + deltas[i].x;
                    shape.frame.y = xy.y + deltas[i].y;
                }
                if (shape.type === ShapeType.Text) {
                    parse_text(shape as TextShape);
                }
                const page = context.selection.selectedPage;
                if (page) {
                    const editor = context.editor.editor4Page(page);
                    const r = editor.insert(page, page.childs.length, shape);
                    if (r) result.push(r);
                }
            }
            if (result.length) {
                context.selection.rangeSelectShape(result);
            }
        } else {
            message('info', context.workspace.t('clipboard.invalid_data'));
        }
    } catch (error) {
        console.log(error);
        message('info', context.workspace.t('clipboard.invalid_data'));
    }
}
/**
 * @description 从剪切板拿出图形数据并替换掉src中的内容
 * @param data 剪切板拿出的数据
 * @param src 将被替换的内容
 */
async function clipboard_text_html_replace(context: Context, data: any, src: Shape[]) {
    try {
        const val = await data.getType('text/html');
        if (!val) throw new Error('invalid value');
        const text_html = await val.text();
        if (!(text_html && typeof text_html === 'string')) throw new Error('read failure');
        const is_shape = text_html.slice(0, 60).indexOf(identity) > -1;
        if (!is_shape) throw new Error('no shapes');
        const source = JSON.parse(text_html.split(identity)[1]);
        const shapes = import_shape(context.data, source);
        if (!shapes.length) throw new Error('invalid source');
        const page = context.selection.selectedPage;
        if (page) {
            const editor = context.editor.editor4Page(page);
            const r = editor.replace(context.data, shapes, src);
            if (r) context.selection.rangeSelectShape(r);
        }
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
    const item: SystemClipboardItem = { type: ShapeType.Image, contentType: 'image/png', content: '' };
    item.contentType = data.types[0];
    const val = await data.getType(item.contentType);
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
        const frame: { width: number, height: number } = { width: 400, height: 100 };
        const val = await data.getType('text/plain');
        if (!val) throw new Error('invalid value');
        const text = await val.text();
        const is_plain = text && typeof text === 'string';
        if (!is_plain) throw new Error('read failure');
        const __xy = adjust_content_xy(context, frame);
        const xy: PageXY = _xy || __xy;
        paster_text(context, xy, text);
    } catch (error) {
        console.log(error);
        message('info', context.workspace.t('clipboard.invalid_data'));
    }
}
/**
 * 调整插入数据的位置以及大小，让插入的数据不会超过可视区域的大小并居中
 * @returns { {x: number,y: number} } 位置
 */
function adjust_content_xy(context: Context, m: { width: number, height: number }) {
    const workspace = context.workspace;
    const root = workspace.root;
    const matrix = workspace.matrix;
    const ratio_wh = m.width / m.height;
    const page_height = root.height / matrix.m00;
    const page_width = root.width / matrix.m00;
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
function paster_image(context: Context, mousedownOnPageXY: PageXY, t: Function, media: Media) {
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
        new_shape = asyncCreator.init_media(page, (parent as GroupShape), name, frame, media);
    }
    if (asyncCreator && new_shape) {
        asyncCreator = asyncCreator.close();
        selection.selectShape(new_shape);
    }
    workspace.setAction(Action.AutoV);
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
        new_shape = asyncCreator.init_text(page, parent, frame, content);
    }
    if (asyncCreator && new_shape) {
        asyncCreator = asyncCreator.close();
        selection.selectShape(new_shape);
    }
    workspace.setAction(Action.AutoV);
    workspace.creating(false);
}
// 不经过剪切板，直接复制(Shape[])
export function paster_short(context: Context, shapes: Shape[]): Shape[] {
    const source = export_shape(shapes);
    const new_source = import_shape(context.data, source);
    const page = context.selection.selectedPage;
    const result: Shape[] = [];
    if (page) {
        for (let i = 0; i < new_source.length; i++) {
            const _s = new_source[i];
            const editor = context.editor4Page(page);
            const r = editor.insert(page, source[i].index + 1, _s, true);
            if (r) { result.push(r) }
        }
    }
    if (result.length) {
        context.selection.rangeSelectShape(result);
    }
    return result;
}
/**
 * 解析文字字符串，转义特殊字符
 * @param shape 
 */
function parse_text(shape: TextShape) {
    const paras = shape.text.paras;
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    for (let i = 0; i < paras.length; i++) {
        const para = paras[i];
        textarea.innerText = para.text;
        const n_v = textarea.value;
        para.text = n_v;
    }
    document.body.removeChild(textarea);
}