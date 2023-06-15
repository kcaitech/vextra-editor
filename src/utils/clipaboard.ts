import { export_shape, Shape } from '@kcdesign/data';
import { Context } from '@/context';
export function clipboard_write(shapes: Shape[]) {
    const content = export_shape(shapes);
    return content;
}
export function copy(context: Context) {
    let result: any = clipboard_write(context.selection.selectedShapes);
    // if (navigator.clipboard && result?.length) {
    //     result = JSON.stringify(result);
    //     console.log(result);
    //     navigator.clipboard.writeText(result).then(() => {
    //         console.log('copy success!');
    //     }, () => {
    //         console.log('copy failed!');
    //     });
    // }
}