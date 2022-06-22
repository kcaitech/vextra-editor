import { union as un, intersect, subtract as sub, xor } from "./b3boolop";
import { b3pathToArr, parsePathString, path2curve, pathArrToB3Path, pathArrToStr, pathToAbsolute } from "./transform";



export function union(path0: string, path1: string): string {
    if (path0.length == 0) {
        return path1;
    }
    if (path1.length == 0) {
        return path0;
    }

    const parsed0 = parsePathString(path0);
    const abs0 = pathToAbsolute(parsed0);
    const curve0 = path2curve(abs0) as (string | number)[][];

    const parsed1 = parsePathString(path1);
    const abs1 = pathToAbsolute(parsed1);
    const curve1 = path2curve(abs1) as (string | number)[][];

    const b3path0 = pathArrToB3Path(curve0);
    const b3path1 = pathArrToB3Path(curve1);
    
    const u = un(b3path0, b3path1);

    return pathArrToStr(b3pathToArr(u));
}

export function intersection(path0: string, path1: string): string {
    if (path0.length == 0 || path1.length == 0) {
        return "";
    }

    const parsed0 = parsePathString(path0);
    const abs0 = pathToAbsolute(parsed0);
    const curve0 = path2curve(abs0) as (string | number)[][];

    const parsed1 = parsePathString(path1);
    const abs1 = pathToAbsolute(parsed1);
    const curve1 = path2curve(abs1) as (string | number)[][];

    const b3path0 = pathArrToB3Path(curve0);
    const b3path1 = pathArrToB3Path(curve1);
    

    const i = intersect(b3path0, b3path1);
    return pathArrToStr(b3pathToArr(i));
}

export function subtract(path0: string, path1: string): string {
    if (path0.length == 0) {
        return path1;
    }
    if (path1.length == 0) {
        return path0;
    }

    const parsed0 = parsePathString(path0);
    const abs0 = pathToAbsolute(parsed0);
    const curve0 = path2curve(abs0) as (string | number)[][];

    const parsed1 = parsePathString(path1);
    const abs1 = pathToAbsolute(parsed1);
    const curve1 = path2curve(abs1) as (string | number)[][];

    const b3path0 = pathArrToB3Path(curve0);
    const b3path1 = pathArrToB3Path(curve1);
    
    const d = sub(b3path0, b3path1);
    return pathArrToStr(b3pathToArr(d));
}

export function difference(path0: string, path1: string): string {
    if (path0.length == 0) {
        return path1;
    }
    if (path1.length == 0) {
        return path0;
    }

    const parsed0 = parsePathString(path0);
    const abs0 = pathToAbsolute(parsed0);
    const curve0 = path2curve(abs0) as (string | number)[][];

    const parsed1 = parsePathString(path1);
    const abs1 = pathToAbsolute(parsed1);
    const curve1 = path2curve(abs1) as (string | number)[][];

    const b3path0 = pathArrToB3Path(curve0);
    const b3path1 = pathArrToB3Path(curve1);
    
    const e = xor(b3path0, b3path1);
    return pathArrToStr(b3pathToArr(e));
}
