import { export_shape, import_shape, Shape, ShapeType, AsyncCreator, ShapeFrame, GroupShape } from '@kcdesign/data';
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
const identity = 'proto/shapes';
export class Clipboard {
    private context: Context;
    constructor(context: Context) {
        this.context = context;
    }
    clipboard_write_shapes(shapes: Shape[]) {
        return export_shape(shapes);
    }
    write_html() {
        const shapes = this.context.selection.selectedShapes;
        const content = this.clipboard_write_shapes(shapes);
        if (navigator.clipboard && navigator.clipboard.write && ClipboardItem) {
            const blob = new Blob([identity + JSON.stringify(content)], { type: 'text/html' });
            navigator.clipboard.write([new ClipboardItem({ 'text/html': blob })]);
        }
    }
    write_plain() { }
}
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
                                clipboard_text_html(context, data[0]);
                            } else if (data[0].types.includes('text/plain')) { // 内容为白板文本
                                clipboard_text_plain(context, data[0]);
                            }
                        } else if (data[0].types.length === 2) {
                            if (data[0].types.includes('text/plain')) { // 内容为白板文本
                                clipboard_text_plain(context, data[0]);
                            }
                        }
                    } else {
                        message('info', t('clipboard.invalid_data'));
                    }
                    context.workspace.setFreezeStatus(false);
                })
                .catch((e) => {
                    message('info', t('clipboard.invalid_data'));
                    context.workspace.setFreezeStatus(false);
                })
        }
    } catch (error) {
        context.workspace.setFreezeStatus(false);
        console.log(error);
    }
}
// 内部shapes复制
function clipboard_text_html(context: Context, data: any) {
    data.getType('text/html').then((val: any) => {
        const fr = new FileReader();
        fr.onload = function (event) {
            const text_html = event.target?.result;
            if (text_html && typeof text_html === 'string') {
                if (text_html.slice(0, 50).indexOf(identity) > -1) {
                    const source = JSON.parse(text_html.split(identity)[1]);
                    const shapes = import_shape(context.data, source);
                    const result: Shape[] = [];
                    if (shapes.length) {
                        for (let i = 0; i < shapes.length; i++) {
                            const shape = shapes[i];
                            const page = context.selection.selectedPage;
                            if (page) {
                                const editor = context.editor.editor4Page(page);
                                const r = editor.insert(page, page.childs.length, shape, true);
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
// 从外部复制一张图片进来
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
// 从外部复制一段文字进来
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
    });
}
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
// 不经过剪切板，直接复制(shapes)
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