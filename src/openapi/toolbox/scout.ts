// import { IContext } from "@/IContext";
// import { {x: number, y: number}, {x: number, y: number} } from "@/IContext/selection";
import { XY } from "@/context/selection";
import {
    Matrix,
    ShapeView,
    // SymbolRefView
} from "@kcdesign/data";

export interface IScout {
    path: SVGPathElement
    remove: () => void
    isPointInShape: (shape: ShapeView, point: {x: number, y: number}) => boolean
    isPointInPath: (d: string, point: {x: number, y: number}) => boolean
    isPointInStroke: (d: string, point: {x: number, y: number}) => boolean
    isPointInShape2: (shape: ShapeView, point: {x: number, y: number}) => boolean
    isPointInStrokeByWidth: (d: string, point: {x: number, y: number}, width: number) => boolean
    isPointInShapeForPreview(shape: ShapeView, point: XY, d: string, matrix: Matrix): boolean
}

