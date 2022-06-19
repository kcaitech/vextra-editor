import { parsePathString, path2curve, pathToAbsolute } from "./transform";
import { union as un, difference as diff, exclusion as xor,intersection as intersect, pathArrToStr } from "./boolop";


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

    const u = un(curve0, curve1);
    return pathArrToStr(u);
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

    const i = intersect(curve0, curve1);
    return pathArrToStr(i);
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

    const d = diff(curve0, curve1);
    return pathArrToStr(d);
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

    const e = xor(curve0, curve1);
    return pathArrToStr(e);
}
