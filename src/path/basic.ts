export const fix_float = 4;
export const accuracy = 1e-6;

export class Point {
    private m_x: number;
    private m_y: number;
    constructor(x: number, y: number) {
        this.m_x = x;
        this.m_y = y;
    }
    static make(x: number, y: number): Point {
        return new Point(x, y);
    }
    get x() {
        return this.m_x;
    }
    get y() {
        return this.m_y;
    }
    extremeClose(p1: Point) {
        return Math.abs(this.x - p1.x) < accuracy &&
            Math.abs(this.y - p1.y) < accuracy;
    }
    isInside(b: Box) {
        return this.x <= b.right && this.x >= b.left &&
            this.y <= b.bottom && this.y >= b.top;
    }
    isStrictInside(b: Box) {
        return this.x < b.right && this.x > b.left &&
            this.y < b.bottom && this.y > b.top;
    }
    toString() {
        const xstr = this.x.toFixed(6);
        const ystr = this.y.toFixed(6);
        return "[" + xstr.substring(0,xstr.lastIndexOf('.')+4) + "," + ystr.substring(0,ystr.lastIndexOf('.')+4) + "]";
    }
    clone() {
        return Point.make(this.x, this.y);
    }
}

export class Box {
    private m_left: number;
    private m_top: number;
    private m_right: number;
    private m_bottom: number;
    constructor(left: number, top: number, right: number, bottom: number) {
        this.m_left = left;
        this.m_top = top;
        this.m_right = right;
        this.m_bottom = bottom;
    }
    static make(p0: Point, p1: Point): Box;
    static make(left: number, top: number, right: number, bottom: number): Box;
    static make(...args: Point[] | number[]): Box {
        let left: number, top: number, right: number, bottom: number;
        if (args.length == 2) {
            const p0: Point = <Point>args[0];
            const p1: Point = <Point>args[1];
            left = Math.min(p0.x, p1.x);
            top = Math.min(p0.y, p1.y);
            right = Math.max(p0.x, p1.x);
            bottom = Math.max(p0.y, p1.y);
        } else {
            left = <number>args[0];
            top = <number>args[1];
            right = <number>args[2];
            bottom = <number>args[3];
        }
        return new Box(left, top, right, bottom);
    }
    get left() {
        return this.m_left;
    }
    get top() {
        return this.m_top;
    }
    get right() {
        return this.m_right;
    }
    get bottom() {
        return this.m_bottom;
    }
    sameBox(b1: Box): boolean {
        return Math.abs(this.left - b1.left) < accuracy &&
            Math.abs(this.top - b1.top) < accuracy &&
            Math.abs(this.right - b1.right) < accuracy &&
            Math.abs(this.bottom - b1.bottom) < accuracy;
    }
    intersect(b1: Box): boolean {
        return this.left <= b1.right && this.right >= b1.left &&
            this.top <= b1.bottom && this.bottom >= b1.top;
    }
    strictIntersect(b1: Box): boolean {
        return this.left < b1.right && this.right > b1.left &&
            this.top < b1.bottom && this.bottom > b1.top;
    }
    contains(b1: Box): boolean {
        return this.left <= b1.left && this.right >= b1.right &&
            this.top <= b1.top && this.bottom >= b1.bottom;
    }
    strictContains(b1: Box): boolean {
        return this.left < b1.left && this.right > b1.right &&
            this.top < b1.top && this.bottom > b1.bottom;
    }
    get width() {
        return this.right - this.left;
    }
    get height() {
        return this.bottom - this.top;
    }
    extremeSmall() {
        return this.width < accuracy && this.height < accuracy;
    }
    union(b: Box) {
        this.m_left = Math.min(this.m_left, b.m_left);
        this.m_top = Math.min(this.m_top, b.m_top);
        this.m_right = Math.max(this.m_right, b.m_right);
        this.m_bottom = Math.max(this.m_bottom, b.m_bottom);
    }
    clone() {
        return Box.make(this.left, this.top, this.right, this.bottom);
    }
}

/**
 * 两根直线相交
 * @returns 
 */
export function intersectPoint(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): Point | undefined {
    if (
        Math.max(x1, x2) < Math.min(x3, x4) ||
        Math.min(x1, x2) > Math.max(x3, x4) ||
        Math.max(y1, y2) < Math.min(y3, y4) ||
        Math.min(y1, y2) > Math.max(y3, y4)
    ) {
        return;
    }
    const nx = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4),
        ny = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4),
        denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

    if (!denominator) {
        return;
    }
    const px = nx / denominator,
        py = ny / denominator,
        px2 = +px.toFixed(2),
        py2 = +py.toFixed(2);
    if (
        px2 < +Math.min(x1, x2).toFixed(2) ||
        px2 > +Math.max(x1, x2).toFixed(2) ||
        px2 < +Math.min(x3, x4).toFixed(2) ||
        px2 > +Math.max(x3, x4).toFixed(2) ||
        py2 < +Math.min(y1, y2).toFixed(2) ||
        py2 > +Math.max(y1, y2).toFixed(2) ||
        py2 < +Math.min(y3, y4).toFixed(2) ||
        py2 > +Math.max(y3, y4).toFixed(2)
    ) {
        return;
    }
    return Point.make(px, py);
}

export function lineLength(p0: Point, p1: Point): number {
    return Math.sqrt((p0.x - p1.x) ** 2 + (p0.y - p1.y) ** 2)
}

export function linePointAt(p0: Point, p1: Point, t: number) {
    const x = (p1.x - p0.x) * t + p0.x;
    const y = (p1.y - p0.y) * t + p0.y;
    return Point.make(x, y);
}

function splitLine(start: Point, end: Point, t: number): Line[] {
    const pAtT = Point.make(start.x + (end.x - start.x) * t, start.y + (end.y - start.y) * t);
    return [Line.make(start, pAtT), Line.make(pAtT, end)];
}

export class Line {
    private m_start: Point;
    private m_end: Point;
    private m_midSplit?: Line[];
    private m_parent?: Line;
    private m_bbox?: Box;
    constructor(start: Point, end: Point) {
        this.m_start = start;
        this.m_end = end;
    }
    static make(start: Point, end: Point): Line {
        return new Line(start, end);
    }
    get start() {
        return this.m_start;
    }
    get end() {
        return this.m_end;
    }
    get bbox() {
        return this.m_bbox || (this.m_bbox = Box.make(this.m_start, this.m_end));
    }
    getIntersectPoint(l: Line): Point | undefined {
        return intersectPoint(this.start.x,
            this.start.y,
            this.end.x,
            this.end.y,
            l.start.x,
            l.start.y,
            l.end.x,
            l.end.y);
    }
    get length() {
        return lineLength(this.m_start, this.m_end);
    }
    getPointAt(t: number): Point {
        return linePointAt(this.m_start, this.m_end, t);
    }
    clone() {
        return Line.make(this.start.clone(), this.end.clone());
    }
    splitAtMid(): Line[] {
        return this.m_midSplit ||
        (this.m_midSplit = splitLine(this.m_start,
            this.m_end, 0.5).map((c) => {
                c.m_parent = this;
                return c;
            }));
    }
    getTRefTo(p: Line): number {
        let c: Line | undefined = this;
        let arr = [];
        while (c) {
            if (c == p) {
                break;
            }
            arr.push(c);
            c = c.m_parent;
        }
        if (c == undefined) {
            return -1;
        }
        arr = arr.reverse();
        let t = 0;
        for (let i = 0, len = arr.length; i < len; i++) {
            const c = arr[i];
            const p = c.m_parent as Line;
            if (c == (p?.m_midSplit as Array<Line>)[1]) {
                t = t + (1 / 2) ** (i + 1);
            }
        }
        return t;
    }
}
