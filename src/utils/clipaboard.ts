import { export_shape, import_shape, Shape, ShapeType, AsyncCreator, ShapeFrame, GroupShape } from '@kcdesign/data';
import { Context } from '@/context';
import { PageXY } from '@/context/selection';
import { Media, Action } from '@/context/workspace';
import { getName } from '@/utils/content';

interface SystemClipboardItem {
    type: ShapeType
    contentType: string
    content: Media | string
}
export function clipboard_write(shapes: Shape[]) {
    const content = export_shape(shapes);
    return content;
}
export function copy(context: Context) {
    let result: any = clipboard_write(context.selection.selectedShapes);
    if (navigator.clipboard && result?.length) {
        result = JSON.stringify(result);
        navigator.clipboard.writeText(result).then(() => {
            console.log('copy success!');
        }, () => {
            console.log('copy failed!');
        });
    }
}
export class Clipboard {
    private carrier: HTMLElement | undefined;
    private context: Context;
    constructor(context: Context) {
        this.context = context;
        this.carrier = document.createElement('span');
        this.carrier.style.display = 'none';
    }
    write_html() {
        const shapes = this.context.selection.selectedShapes;
        const content = clipboard_write(shapes);
        if (this.carrier) {
            const blob = new Blob(['-shapes-' + JSON.stringify(content)], { type: 'text/html' });
            if (navigator.clipboard) {
                navigator.clipboard.write([new ClipboardItem({ 'text/html': blob })]);
            }
        }
    }
    write_plain() {

    }
}
export function paster(context: Context, t: Function, xy?: PageXY) {
    try {
        if (navigator.clipboard && navigator.clipboard.read) {
            context.workspace.setFreezeStatus(true);
            navigator.clipboard.read()
                .then(function (data) {
                    if (data && data.length) { // 存在有效内容
                        if (data[0].types[0].indexOf('image') !== -1) { // 内容为一张图片
                            set_clipboard_image(context, data[0], t, xy)
                        } else if (data[0].types.includes('text/html')) {
                            data[0].getType('text/html').then(val => { // 图形
                                const fr = new FileReader();
                                fr.onload = function (event) {
                                    const text = event.target?.result;
                                    if (text) {
                                        if ((text as string).slice(0, 50).indexOf('-shapes-') > -1) {
                                            const source = JSON.parse((text as any).split('-shapes-')[1]);
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
                                        }
                                    }
                                }
                                fr.readAsText(val);
                            });
                        } else if (data[0].types.includes('text/plain')) { // 白板文本
                            data[0].getType('text/plain').then(val => {
                                const fr = new FileReader();
                                fr.onload = function (event) {
                                    const text = event.target?.result;
                                    if (text) {
                                        console.log('plain', text);
                                    }
                                }
                                fr.readAsText(val);
                            });
                        }
                    } else {
                        // todo 没有有效内容
                    }
                    context.workspace.setFreezeStatus(false);
                })
                .catch((e) => {
                    console.log(e);
                    context.workspace.setFreezeStatus(false);
                })
        }
    } catch (error) {
        context.workspace.setFreezeStatus(false);
        console.log(error);
    }
}
// 复制一张图片
async function set_clipboard_image(context: Context, data: any, t: Function, _xy?: PageXY) {
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
                        const __xy = adjust_content_xy(context, content);
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
function adjust_content_xy(context: Context, m: Media) {
    const workspace = context.workspace;
    const root = workspace.root;
    const matrix = workspace.matrix;
    const ratio_wh = m.frame.width / m.frame.height;
    const page_height = root.height / matrix.m00;
    const page_width = root.width / matrix.m00;
    if (m.frame.height >= m.frame.width) {
        if (m.frame.height > page_height * 0.95) {
            m.frame.height = page_height * 0.95;
            m.frame.width = m.frame.height * ratio_wh;
        }
    } else {
        if (m.frame.width > page_width * 0.95) {
            m.frame.width = page_width * 0.95;
            m.frame.height = m.frame.width / ratio_wh;
        }
    }
    const page_center = matrix.inverseCoord(root.center);
    return { x: page_center.x - m.frame.width / 2, y: page_center.y - m.frame.height / 2 };
}
function paster_image(context: Context, mousedownOnPageXY: PageXY, t: Function, media: Media) {
    const selection = context.selection;
    const workspace = context.workspace;
    const type = ShapeType.Image;
    const page = selection.selectedPage;
    const parent = selection.selectedPage;
    let asyncCreator: AsyncCreator | undefined;
    let new_shape: Shape | undefined;
    const frame = new ShapeFrame(mousedownOnPageXY.x, mousedownOnPageXY.y, 100, 100);
    if (page && parent && type) {
        const editor = context.editor.controller();
        const name = getName(type, parent.childs, t);
        asyncCreator = editor.asyncCreator(mousedownOnPageXY);
        if (type === ShapeType.Image) {
            frame.height = media.frame.height;
            frame.width = media.frame.width;
            new_shape = asyncCreator.init_media(page, (parent as GroupShape), name, frame, media);
        }
    }
    if (asyncCreator && new_shape) {
        asyncCreator = asyncCreator.close();
        selection.selectShape(new_shape);
    }
    workspace.setAction(Action.AutoV);
    workspace.creating(false);
}