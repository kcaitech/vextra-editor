import { export_shape, Shape } from '@kcdesign/data';
import { Context } from '@/context';
export function clipboard_write(shapes: Shape[]) {
    const content = export_shape(shapes);
    return content;
}
export function copy(context: Context) {
    let result: any = clipboard_write(context.selection.selectedShapes);
    if (navigator.clipboard && result?.length) {
        result = JSON.stringify(result);
        console.log(result);
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
        if (this.carrier) {
            const blob = new Blob(['https://test.protodesign.cn/zrx/#/document?id=117879034838269952'], { type: 'text/html' });
            if (navigator.clipboard) {
                navigator.clipboard.write([new ClipboardItem({ 'text/html': blob })]);
            }
        }
    }
    write_plain() {

    }
}