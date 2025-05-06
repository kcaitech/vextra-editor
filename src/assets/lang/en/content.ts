import { GradientType, ShapeType } from "@kcdesign/data";
export const shape: any = {
    group: "Group",
    page: "Page",
    line: "Straight line",
    oval: "Roundness",
    rect: "Rectangle",
    path: "Path",
    artboard: "Frame",
    arrow: "Arrow",
    text: "Text",
    image: "Image",
    input_text: "Input text",
    table: "Table",
    contact: "Connecting line",
    cutout: "Cutout",
    shape_tool: "Shape tool",
    symbol: "Component",
    curve: "Curve tool",
    clip: "Crop tool",
    default: "Default",
    pen: "Pen",
    pencil: "Pencil",
    polygon: "Polygon",
    star: "Star",
    instance: "Instance",
    bool: "Bool"
}
shape[ShapeType.Rectangle] = "Rectangle";

export const color = {
    solid: "Solid",
    linear: "Linear gradient",
    radial: "Radial gradient",
    angular: "Angular gradient",
    esc: "Press ESC to exit",
    recently: "Recent used", // todo refer figma
    documentc: "Document usage",
    times: "Use xx times",
    rotate: "Rotate 90 degrees",
    reverse: "Reverse" // todo refer figma
}
color[GradientType.Linear] = "Linear gradient";
color[GradientType.Radial] = "Radial gradient";
color[GradientType.Angular] = "Angular gradient";