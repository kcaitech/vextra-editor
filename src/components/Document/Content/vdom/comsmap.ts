import { ViewType, ShapeType } from "@kcdesign/data";

import { ArtboradDom } from "./artboard";
import { ContactLineDom } from "./contactline";
import { GroupShapeDom } from "./groupshape";
import { ImageShapeDom } from "./imageshape";
import { LineDom } from "./line";
import { PathShapeDom } from "./pathshape";
import { PathShapeDom2 } from "./pathshape2";
import { SymbolDom } from "./symbol";
import { SymbolRefDom } from "./symbolref";
import { TableCellDom } from "./tablecell";
import { TableDom } from "./table";
import { TextShapeDom } from "./textshape";

// interface DataView {
//     id: string;
// }
// type VarsContainer = (SymbolRefShape | SymbolShape)[];
// interface PropsType {
//     data: Shape;
//     transx?: RenderTransform;
//     varsContainer?: VarsContainer;
// }
// interface ComType {
//     new(ctx: DViewCtx, props: PropsType): DataView;
// }

export function initComsMap(comsMap: Map<ShapeType, ViewType>) {
    
    comsMap.set(ShapeType.Artboard, ArtboradDom);
    comsMap.set(ShapeType.Group, GroupShapeDom);
    comsMap.set(ShapeType.Image, ImageShapeDom);
    // comsMap.set(ShapeType.Page, ShapeGroup);
    comsMap.set(ShapeType.Path, PathShapeDom);
    comsMap.set(ShapeType.Path2, PathShapeDom2);
    comsMap.set(ShapeType.Rectangle, PathShapeDom);
    comsMap.set(ShapeType.Oval, PathShapeDom);
    comsMap.set(ShapeType.Text, TextShapeDom);
    comsMap.set(ShapeType.Symbol, SymbolDom);
    comsMap.set(ShapeType.SymbolUnion, SymbolDom);
    comsMap.set(ShapeType.SymbolRef, SymbolRefDom);
    comsMap.set(ShapeType.Line, LineDom);
    comsMap.set(ShapeType.Table, TableDom);
    comsMap.set(ShapeType.Contact, ContactLineDom);
    comsMap.set(ShapeType.TableCell, TableCellDom);
}
