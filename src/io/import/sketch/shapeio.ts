import {
    ExportOptions,
    GroupShape,
    ImageShape,
    PathShape,
    CurvePoint,
    RectShape,
    Shape,
    ShapeFrame,
    FlattenShape,
    SymbolShape,
    SymbolRefShape,
    TextShape,
    ExportFormat
} from "@kcdesign/data/data/shape";
import { Color } from "@kcdesign/data/data/style";
import { importXY, importStyle, importColor } from "./styleio";
import { Page } from "@kcdesign/data/data/page";
import { importText } from "./textio";
import { Artboard } from "@kcdesign/data/data/artboard";
import { Text } from "@kcdesign/data/data/text";
import { ShapeType, TextBehaviour, BoolOp, CurveMode, Point2D } from "@kcdesign/data/data/classes"
import { BasicArray } from "@kcdesign/data/data/basic";

interface IJSON {
    [key: string]: any
}

type ImportFun = (data: IJSON) => Shape

function importExportOptions(data: IJSON): ExportOptions {
    return ((d) => {
        return new ExportOptions(
            new BasicArray<ExportFormat>(),
            new BasicArray<string>(),
            0,
            false)
    }
    )(data['exportOptions']);
}

function importShapeFrame(data: IJSON): ShapeFrame {
    const d: IJSON = data['frame'];
    const x = d['x'];
    const y = d['y'];
    const width = d['width'];
    const height = d['height'];
    return new ShapeFrame(x, y, width, height);
}

function importBoolOp(data: IJSON): BoolOp {
    return [BoolOp.Union, BoolOp.Subtract, BoolOp.Intersect, BoolOp.Diff][data['booleanOperation']] ?? BoolOp.None;
}

function importPoints(data: IJSON): CurvePoint[] {
    return (data['points'] || []).map((d: IJSON) => {
        const cornerRadius: number = d['cornerRadius'];
        const curveFrom: Point2D = importXY(d['curveFrom']);
        const curveMode: CurveMode = ((t) => {
            return [CurveMode.None, CurveMode.Straight, CurveMode.Mirrored, CurveMode.Asymmetric, CurveMode.Disconnected][t] ?? CurveMode.None;
        })(d['curveMode']);
        const curveTo: Point2D = importXY(d['curveTo']);
        const hasCurveFrom: boolean = d['hasCurveFrom'];
        const hasCurveTo: boolean = d['hasCurveTo'];
        const point: Point2D = importXY(d['point']);
        return new CurvePoint(cornerRadius, curveFrom, curveTo, hasCurveFrom, hasCurveTo, curveMode, point);
    });
}

function importOverrides(shape: SymbolRefShape, data: IJSON[]) {
    // console.log(data)
    for (let i = 0, len = data.length; i < len; i++) {
        const override = data[i];
        // "0E2D5DC1-524E-4198-AA15-E88DC8C4A8C0_stringValue" -> string
        // "1F0F8091-1390-46BB-B3B2-BF697DF68454_layerStyle" -> sharedStyleID
        const name = override['overrideName'];
        // "2A327495-1793-4570-BC24-1429F142D09C"
        const value = override['value'];
        const _idx = name.indexOf('_');
        const id = name.substring(0, _idx);
        const attr = name.substring(_idx + 1);

        shape.addOverrid(id, attr, value);
    }
}

function importShapePropertys(shape: Shape, data:IJSON) {
    shape.isFixedToViewport = data['isFixedToViewport']
    shape.isFlippedHorizontal = data['isFlippedHorizontal']
    shape.isFlippedVertical = data['isFlippedVertical']
    shape.rotation = data['rotation']
}

export function importArtboard(data: IJSON, f: ImportFun): Artboard {
    // const type = importShapeType(data);
    const id: string = data['do_objectID'];
    const exportOptions = importExportOptions(data);
    const frame = importShapeFrame(data);
    const name: string = data['name'];
    const booleanOperation = importBoolOp(data);
    // const points: Point[] = importPoints(data);
    // const image = data['image'];
    // const imageRef = image && image['_ref'];
    const style = importStyle(data['style']);
    if (data['sharedStyleID']) {
        // env.styleMgr.addShared(data['sharedStyleID'], style);
    }
    // const text = data['attributedString'] && importText(data['attributedString']);
    // const isClosed = data['isClosed'];

    const hasBackgroundColor: boolean = data['hasBackgroundColor'];
    const includeBackgroundColorInExport: boolean = data['includeBackgroundColorInExport'];
    const backgroundColor: Color | undefined = data['backgroundColor'] && importColor(data['backgroundColor']);

    const childs = (data['layers'] || []).map((d: IJSON) => f(d));
    const shape = new Artboard(id, name, ShapeType.Artboard, frame, style, booleanOperation, new BasicArray<Shape>(...childs));

    shape.hasBackgroundColor = hasBackgroundColor;
    shape.includeBackgroundColorInExport = includeBackgroundColorInExport;
    if (backgroundColor) shape.backgroundColor = backgroundColor;
    importShapePropertys(shape, data);
    return shape;
}

export function importGroupShape(data: IJSON, f: ImportFun): GroupShape {
    // const type = importShapeType(data);
    const id: string = data['do_objectID'];
    const exportOptions = importExportOptions(data);
    const frame = importShapeFrame(data);
    const name: string = data['name'];
    const booleanOperation = importBoolOp(data);
    // const points: Point[] = importPoints(data);
    // const image = data['image'];
    // const imageRef = image && image['_ref'];
    const style = importStyle(data['style']);
    if (data['sharedStyleID']) {
        // env.styleMgr.addShared(data['sharedStyleID'], style);
    }
    // const text = data['attributedString'] && importText(data['attributedString']);
    // const isClosed = data['isClosed'];
    const childs: Shape[] = (data['layers'] || []).map((d: IJSON) => f(d));
    const shape = new GroupShape(id, name, ShapeType.Group, frame, style, booleanOperation, new BasicArray<Shape>(...childs));
    importShapePropertys(shape, data);
    return shape;
}

export function importShapeGroupShape(data: IJSON, f: ImportFun): FlattenShape {
    // const type = importShapeType(data);
    const id: string = data['do_objectID'];
    const exportOptions = importExportOptions(data);
    const frame = importShapeFrame(data);
    const name: string = data['name'];
    const booleanOperation = importBoolOp(data);
    // const points: Point[] = importPoints(data);
    // const image = data['image'];
    // const imageRef = image && image['_ref'];
    const style = importStyle(data['style']);
    if (data['sharedStyleID']) {
        // env.styleMgr.addShared(data['sharedStyleID'], style);
    }
    // const text = data['attributedString'] && importText(data['attributedString']);
    // const isClosed = data['isClosed'];
    const childs: Shape[] = (data['layers'] || []).map((d: IJSON) => f(d));
    const shape = new FlattenShape(id, name, ShapeType.FlattenShape, frame, style, booleanOperation, new BasicArray<Shape>(...childs));
    importShapePropertys(shape, data);
    return shape;
}

export function importImage(data: IJSON, f: ImportFun): ImageShape {
    // const type = importShapeType(data);
    const id: string = data['do_objectID'];
    const exportOptions = importExportOptions(data);
    const frame = importShapeFrame(data);
    const name: string = data['name'];
    const booleanOperation = importBoolOp(data);
    // const points: Point[] = importPoints(data);
    const image = data['image'];
    const ref = image && image['_ref'] || "";
    const imageRef = ref.substring(ref.indexOf('/') + 1);
    const style = importStyle(data['style']);
    if (data['sharedStyleID']) {
        // env.styleMgr.addShared(data['sharedStyleID'], style);
    }
    // const text = data['attributedString'] && importText(data['attributedString']);
    // const isClosed = data['isClosed'];
    // env.mediaMgr.addRef(imageRef);
    const shape = new ImageShape(id, name, ShapeType.Image, frame, style, booleanOperation, imageRef);
    // shape.setImageMgr(env.mediaMgr);
    importShapePropertys(shape, data);
    return shape;
}

export function importPage(data: IJSON, f: ImportFun): Page {
    // const type = importShapeType(data);
    const id: string = data['do_objectID'];
    const exportOptions = importExportOptions(data);
    const frame = importShapeFrame(data);
    const name: string = data['name'];
    const booleanOperation = importBoolOp(data);
    // const points: Point[] = importPoints(data);
    // const image = data['image'];
    // const imageRef = image && image['_ref'];
    const style = importStyle(data['style']);
    if (data['sharedStyleID']) {
        // env.styleMgr.addShared(data['sharedStyleID'], style);
    }
    // const text = data['attributedString'] && importText(data['attributedString']);
    // const isClosed = data['isClosed'];

    const childs: Shape[] = (data['layers'] || []).map((d: IJSON) => f(d));
    const shape = new Page(id, name, ShapeType.Page, frame, style, booleanOperation, new BasicArray<Shape>(...childs));
    // shape.appendChilds(childs);
    importShapePropertys(shape, data);
    return shape;
}

export function importPathShape(data: IJSON, f: ImportFun): PathShape {
    // const type = importShapeType(data);
    const id: string = data['do_objectID'];
    const exportOptions = importExportOptions(data);
    const frame = importShapeFrame(data);
    const name: string = data['name'];
    const booleanOperation = importBoolOp(data);
    const points: CurvePoint[] = importPoints(data);
    // const image = data['image'];
    // const imageRef = image && image['_ref'];
    const style = importStyle(data['style']);
    if (data['sharedStyleID']) {
        // env.styleMgr.addShared(data['sharedStyleID'], style);
    }
    // const text = data['attributedString'] && importText(data['attributedString']);
    const isClosed = data['isClosed'];

    const shape = new PathShape(id, name, ShapeType.Path, frame, style, booleanOperation, new BasicArray<CurvePoint>(...points));
    shape.isClosed = isClosed;
    importShapePropertys(shape, data);
    return shape;
}

export function importRectShape(data: IJSON, f: ImportFun): RectShape {
    // const type = importShapeType(data);
    const id: string = data['do_objectID'];
    const exportOptions = importExportOptions(data);
    const frame = importShapeFrame(data);
    const name: string = data['name'];
    const booleanOperation = importBoolOp(data);
    const points: CurvePoint[] = importPoints(data);
    // const points: Point[] = importPoints(data);
    // const image = data['image'];
    // const imageRef = image && image['_ref'];
    const style = importStyle(data['style']);
    if (data['sharedStyleID']) {
        // env.styleMgr.addShared(data['sharedStyleID'], style);
    }
    // const text = data['attributedString'] && importText(data['attributedString']);
    // const isClosed = data['isClosed'];

    const shape = new RectShape(id, name, ShapeType.Rectangle, frame, style, booleanOperation, new BasicArray<CurvePoint>(...points), 0);
    importShapePropertys(shape, data);
    shape.fixedRadius = data['fixedRadius']

    return shape;
}

export function importTextShape(data: IJSON, f: ImportFun): TextShape {
    // const type = importShapeType(data);
    const id: string = data['do_objectID'];
    const exportOptions = importExportOptions(data);
    const frame = importShapeFrame(data);
    const name: string = data['name'];
    const booleanOperation = importBoolOp(data);
    // const points: Point[] = importPoints(data);
    // const image = data['image'];
    // const imageRef = image && image['_ref'];
    const style = importStyle(data['style']);
    if (data['sharedStyleID']) {
        // env.styleMgr.addShared(data['sharedStyleID'], style);
    }
    const textStyle = data['style'] && data['style']['textStyle'];
    const text: Text = data['attributedString'] && importText(data['attributedString'], textStyle);
    const textBehaviour = [TextBehaviour.Flexible, TextBehaviour.Fixed, TextBehaviour.FixWidthAndHeight][data['textBehaviour']] ?? TextBehaviour.Flexible;
    text.attr && (text.attr.textBehaviour = textBehaviour);
    // const isClosed = data['isClosed'];
    const shape = new TextShape(id, name, ShapeType.Text, frame, style, booleanOperation, text);
    importShapePropertys(shape, data);
    return shape;
}

export function importSymbol(data: IJSON, f: ImportFun): SymbolShape {
    // const type = importShapeType(data);
    // const id: string = data['do_objectID'];
    const exportOptions = importExportOptions(data);
    const frame = importShapeFrame(data);
    const name: string = data['name'];
    const booleanOperation = importBoolOp(data);
    // const points: Point[] = importPoints(data);
    // const image = data['image'];
    // const imageRef = image && image['_ref'];
    const style = importStyle(data['style']);
    if (data['sharedStyleID']) {
        // env.styleMgr.addShared(data['sharedStyleID'], style);
    }
    // const text = data['attributedString'] && importText(data['attributedString']);
    // const isClosed = data['isClosed'];
    const id = data['symbolID'];
    const childs: Shape[] = (data['layers'] || []).map((d: IJSON) => f(d));
    const shape = new SymbolShape(id, name, ShapeType.Symbol, frame, style, booleanOperation, new BasicArray<Shape>(...childs));
    // env.symbolManager.addSymbol(id, name, env.pageId, shape);
    // shape.appendChilds(childs);
    importShapePropertys(shape, data);
    return shape;
}

export function importSymbolRef(data: IJSON, f: ImportFun): SymbolRefShape {
    // const type = importShapeType(data);
    const id: string = data['do_objectID'];
    const exportOptions = importExportOptions(data);
    const frame = importShapeFrame(data);
    const name: string = data['name'];
    const booleanOperation = importBoolOp(data);
    // const points: Point[] = importPoints(data);
    // const image = data['image'];
    // const imageRef = image && image['_ref'];
    const style = importStyle(data['style']);
    if (data['sharedStyleID']) {
        // env.styleMgr.addShared(data['sharedStyleID'], style);
    }
    // const text = data['attributedString'] && importText(data['attributedString']);
    // const isClosed = data['isClosed'];

    const shape = new SymbolRefShape(id, name, ShapeType.SymbolRef, frame, style, booleanOperation, data['symbolID']);

    if (data['overrideValues']) importOverrides(shape, data['overrideValues']);
    importShapePropertys(shape, data);
    return shape;
}

// export function importShape(data: IJSON): Shape {

//     switch ((data['_class'])) {
//         case 'rectangle':
//             return importRectShape(data); // ShapeType.Rectangle;
//         case 'shapeGroup':
//             return importShapeGroupShape(data); // ShapeType.ShapeGroup;
//         case 'group':
//             return importGroupShape(data); // ShapeType.Group;
//         case 'shapePath':
//             return importPathShape(data); // ShapeType.Path;
//         case 'artboard':
//             return importArtboard(data); // ShapeType.Artboard;
//         case 'bitmap':
//             return importImage(data); // ShapeType.Image;
//         case 'page':
//             return importPage(data); // ShapeType.Page;
//         case 'text':
//             return importTextShape(data); // ShapeType.Text;
//         case 'oval':
//         case 'star':
//         case 'triangle':
//         case 'polygon':
//             return importPathShape(data); // ShapeType.Path;
//         case 'symbolMaster':
//             return importSymbol(data); // ShapeType.Symbol;
//         case 'symbolInstance':
//             return importSymbolRef(data); // ShapeType.SymbolRef;
//         default:
//             return importRectShape(data); // ShapeType.Rectangle;
//     }
// }