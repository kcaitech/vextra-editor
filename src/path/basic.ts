export const accuracy = 1e-6;

export interface Point {
    x: number;
    y: number;
}

export function extremeClose(p0: Point, p1: Point) {
    return Math.abs(p0.x - p1.x) < accuracy &&
        Math.abs(p0.y - p1.y) < accuracy;
}

export function pointInside(p: Point, b: Box) {
    return p.x <= b.right && p.x >= b.left &&
        p.y <= b.bottom && p.y >= b.top;
}

export interface Box {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

export function makeBox(p0: Point, p1: Point): Box {
    const left = Math.min(p0.x, p1.x);
    const top = Math.min(p0.y, p1.y);
    const right = Math.max(p0.x, p1.x);
    const bottom = Math.max(p0.y, p1.y);
    return {left, top, right, bottom};
}

export function sameBox(b0: Box, b1: Box): boolean {
    return Math.abs(b0.left - b1.left) < accuracy &&
        Math.abs(b0.top - b1.top) < accuracy &&
        Math.abs(b0.right - b1.right) < accuracy &&
        Math.abs(b0.bottom - b1.bottom) < accuracy;
}

export function intersect(b0: Box, b1: Box): boolean {
    return b0.left <= b1.right && b0.right >= b1.left &&
        b0.top <= b1.bottom && b0.bottom >= b1.top;
}

export function strictIntersect(b0: Box, b1: Box): boolean {
    return b0.left < b1.right && b0.right > b1.left &&
        b0.top < b1.bottom && b0.bottom > b1.top;
}

export function contains(b0: Box, b1: Box): boolean {
    return b0.left <= b1.left && b0.right >= b1.right &&
        b0.top <= b1.top && b0.bottom >= b1.bottom;
}

export function strictContains(b0: Box, b1: Box): boolean {
    return b0.left < b1.left && b0.right > b1.right &&
        b0.top < b1.top && b0.bottom > b1.bottom;
}

export function width(b: Box) {
    return b.right - b.left;
}

export function height(b: Box) {
    return b.bottom - b.top;
}

export function extremeSmall(b: Box) {
    return width(b) < accuracy && height(b) < accuracy;
}