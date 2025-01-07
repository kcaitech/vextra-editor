import { GradientType, ShapeType } from "@kcdesign/data";
export const shape: any = {
    group: "Group",
    page: "Page",
    line: 'Line',
    oval: 'Oval',
    rect: 'Rect',
    path: 'Vector',
    artboard: 'Frame',
    arrow: 'Arrow',
    text: 'text',
    image: 'image',
    input_text: 'Input text',
    table: 'Table',
    contact: 'Contact',
    cutout: 'Cutout',
    shape_tool: 'Shape tool',
    symbol: 'Symbol',
    curve: "Curve",
    clip: "Clip",
    default: 'Default',
    pen: 'Pen',
    pencil: 'Pencil',
    polygon: 'Polygon',
    star: 'Star',
}
shape[ShapeType.Rectangle] = 'Rectangle';

export const color = {
    solid: 'Solid',
    linear: 'Liner',
    radial: 'Radial',
    angular: 'Angular',
    esc: 'Press ESC to exit',
    recently: 'Recently used',
    documentc: 'Document colors',
    times: 'Used xx times',
    rotate: 'Rotate',
    reverse: 'Reverse'
}
color[GradientType.Linear] = 'Linear gradient';
color[GradientType.Radial] = 'Radial gradient';
color[GradientType.Angular] = 'Angular gradient';