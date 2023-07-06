import { export_shape, import_shape, Shape, ShapeType, AsyncCreator, ShapeFrame, GroupShape, TextShape } from '@kcdesign/data';
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
const identity = 'cn.protodesign/clipboard';
export class Clipboard {
    private context: Context;
    constructor(context: Context) {
        this.context = context;
    }
    clipboard_write_shapes(shapes: Shape[]) {
        return export_shape(shapes);
    }
    /**
     * 往剪切板写入图形数据
     * @returns 
     */
    write_html(): boolean {
        const shapes = this.context.selection.selectedShapes;
        const position_map: Map<string, ShapeFrame> = new Map();
        for (let i = 0; i < shapes.length; i++) {
            position_map.set(shapes[i].id, shapes[i].frame2Root());
        }
        const content = this.clipboard_write_shapes(shapes);
        if (!content) return false;
        for (let i = 0; i < content.length; i++) {
            const shape = content[i].content;
            const root_frame = position_map.get(shape.id);
            if (root_frame) {
                shape.frame = root_frame;
            }
        }
        if (navigator.clipboard && navigator.clipboard.write && ClipboardItem) {
            const blob = new Blob([`${identity}${JSON.stringify(content)}` || ''], { type: 'text/html' });
            navigator.clipboard.write([new ClipboardItem({ 'text/html': blob })]);
            return true;
        }
        return false;
    }
    write_plain() { }
}
/**
 * 粘贴
 * @param xy 以xy为锚点，不存在xy时，粘贴在原来的位置
 */
export function paster(context: Context, t: Function, xy?: PageXY) {
    try {
        if (navigator.clipboard && navigator.clipboard.read) {
            context.workspace.setFreezeStatus(true);
            navigator.clipboard.read()
                .then(function (data) {
                    if (data && data.length) { // 存在有效内容
                        if (data[0].types[0].indexOf('image') !== -1) { // 内容为一张图片
                            clipboard_image(context, data[0], t, xy)
                        } else if (data[0].types.length === 1) {
                            if (data[0].types.includes('text/html')) { // 内容为Shape[]
                                clipboard_text_html(context, data[0], xy);
                            } else if (data[0].types.includes('text/plain')) { // 内容为白板文本
                                clipboard_text_plain(context, data[0], xy);
                            }
                        } else if (data[0].types.length === 2) {
                            if (data[0].types.includes('text/plain')) { // 内容为白板文本
                                clipboard_text_plain(context, data[0], xy);
                            }
                        }
                    } else {
                        message('info', t('clipboard.invalid_data'));
                    }
                    context.workspace.setFreezeStatus(false);
                })
                .catch((e) => {
                    console.log(e);
                    message('info', t('clipboard.invalid_data'));
                    context.workspace.setFreezeStatus(false);
                })
        }
    } catch (error) {
        message('info', t('clipboard.invalid_data'));
        context.workspace.setFreezeStatus(false);
    }
}
/**
 * 从剪切板拿出数据替换掉src的内容，以src中每个图形的左上角为锚点
 * @returns 
 */
export function replace(context: Context, t: Function, src: Shape[]) {
    try {
        if (navigator.clipboard && navigator.clipboard.read) {
            context.workspace.setFreezeStatus(true);
            navigator.clipboard.read()
                .then(function (data) {
                    if (data && data.length) { // 存在有效内容
                        if (data[0].types.length === 1) {
                            if (data[0].types.includes('text/html')) { // 内容为Shape[]
                                clipboard_text_html_replace(context, data[0], src);
                                return true;
                            } else {
                                message('info', t('system.replace_failed'));
                                context.workspace.setFreezeStatus(false);
                                return false;
                            }
                        }
                    } else {
                        message('info', t('system.replace_failed'));
                        context.workspace.setFreezeStatus(false);
                        return false;
                    }
                    context.workspace.setFreezeStatus(false);
                })
                .catch((e) => {
                    console.log(e);
                    message('info', t('system.replace_failed'));
                    context.workspace.setFreezeStatus(false);
                    return false;
                })
        }
        return true;
    } catch (error) {
        message('info', t('system.replace_failed'));
        context.workspace.setFreezeStatus(false);
        return false;
    }
}
/**
 * 从剪切板拿出图形数据并插入文档
 * @param data 剪切板拿出的数据
 * @param xy 插入的地方
 */
function clipboard_text_html(context: Context, data: any, xy?: PageXY) {
    data.getType('text/html').then((val: any) => {
        const fr = new FileReader();
        fr.onload = function (event) {
            const text_html = event.target?.result;
            if (text_html && typeof text_html === 'string') {
                if (text_html.slice(0, 60).indexOf(identity) > -1) {
                    const source = JSON.parse(text_html.split(identity)[1]);
                    const shapes = import_shape(context.data, source);
                    const result: Shape[] = [];
                    if (shapes.length) {
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
                    }
                } else {
                    message('info', context.workspace.t('clipboard.invalid_data'));
                }
            }
        }
        fr.readAsText(val);
    }).catch((e: Error) => {
        console.log(e);
    });
}
/**
 * 从剪切板拿出图形数据并替换掉src中的内容
 * @param data 剪切板拿出的数据
 * @param src 将被替换的内容
 */
function clipboard_text_html_replace(context: Context, data: any, src: Shape[]) {
    data.getType('text/html').then((val: any) => {
        const fr = new FileReader();
        fr.onload = function (event) {
            const text_html = event.target?.result;
            if (text_html && typeof text_html === 'string') {
                if (text_html.slice(0, 60).indexOf(identity) > -1) {
                    const source = JSON.parse(text_html.split(identity)[1]);
                    const shapes = import_shape(context.data, source);
                    if (shapes.length) {
                        const page = context.selection.selectedPage;
                        if (page) {
                            const editor = context.editor.editor4Page(page);
                            const r = editor.replace(context.data, shapes, src);
                            if (r) context.selection.rangeSelectShape(r);
                        }
                    }
                } else {
                    message('info', context.workspace.t('system.replace_failed'));
                }
            }
        }
        fr.readAsText(val);
    }).catch((e: Error) => {
        console.log(e);
    });
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
function clipboard_text_plain(context: Context, data: any, _xy?: PageXY) {
    const frame: { width: number, height: number } = { width: 400, height: 100 };
    data.getType('text/plain').then((val: any) => {
        const fr = new FileReader();
        fr.onload = function (event) {
            const text = event.target?.result;
            if (text && typeof text === 'string') {
                const __xy = adjust_content_xy(context, frame);
                const xy: PageXY = _xy || __xy;
                paster_text(context, xy, text);
            }
        }
        fr.readAsText(val);
    }).catch((e: Error) => {
        console.log(e);
        message('info', context.workspace.t('clipboard.invalid_data'));
    });
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