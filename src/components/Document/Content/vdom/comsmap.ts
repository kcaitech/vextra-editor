/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { ViewType, ShapeType } from "@kcdesign/data";

import { ArtboardDom } from "./artboard";
import { ContactLineDom } from "./contactline";
import { GroupShapeDom } from "./groupshape";
import { LineDom } from "./line";
import { PathShapeDom } from "./pathshape";
import { PathShapeDom2 } from "./pathshape2";
import { SymbolDom } from "./symbol";
import { SymbolRefDom } from "./symbolref";
import { TableCellDom } from "./tablecell";
import { TableDom } from "./table";
import { TextShapeDom } from "./textshape";
import { CutoutShapeDom } from "./cutout";
import { RectShapeDom } from "./rect";
import { BoolShapeDom } from "./boolshape";
import { StarShapeDom } from "./star";
import { PolygonShapeDom } from "./polygon";
import { Table2Dom } from "./table2";


export function initComsMap(comsMap: Map<ShapeType, ViewType>) {
    comsMap.set(ShapeType.Artboard, ArtboardDom);
    comsMap.set(ShapeType.Group, GroupShapeDom);
    comsMap.set(ShapeType.Image, RectShapeDom);
    comsMap.set(ShapeType.BoolShape, BoolShapeDom);
    comsMap.set(ShapeType.Path, PathShapeDom);
    comsMap.set(ShapeType.Path2, PathShapeDom2);
    comsMap.set(ShapeType.Oval, PathShapeDom);
    comsMap.set(ShapeType.Text, TextShapeDom);
    comsMap.set(ShapeType.Symbol, SymbolDom);
    comsMap.set(ShapeType.SymbolUnion, SymbolDom);
    comsMap.set(ShapeType.SymbolRef, SymbolRefDom);
    comsMap.set(ShapeType.Line, LineDom);
    comsMap.set(ShapeType.Table, TableDom);
    comsMap.set(ShapeType.Table2, Table2Dom);
    comsMap.set(ShapeType.Contact, ContactLineDom);
    comsMap.set(ShapeType.TableCell, TableCellDom as any as ViewType);
    comsMap.set(ShapeType.Cutout, CutoutShapeDom);
    comsMap.set(ShapeType.Rectangle, RectShapeDom);
    comsMap.set(ShapeType.Star, StarShapeDom);
    comsMap.set(ShapeType.Polygon, PolygonShapeDom);
}
