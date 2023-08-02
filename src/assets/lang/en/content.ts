import { ShapeType } from "@kcdesign/data";
export const shape: any = {
    group: "Group",
    page: "Page",
    line: 'Line',
    oval: 'Oval',
    artboard: 'Artboard',
    arrow: 'Arrow',
    text: 'text',
    image: 'image',
    input_text: 'Input text',
}
shape[ShapeType.Rectangle] = 'Rectangle';

export const color = {
    solid: 'Solid',
    esc: 'Press ESC to exit',
    recently: 'Recently used',
    documentc: 'Document colors',
    times: 'Used xx times'
}