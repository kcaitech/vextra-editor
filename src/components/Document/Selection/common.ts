
export function genRectPath(points: { x: number, y: number }[]): string {
    let path = ""
    for (let i = 0, len = points.length; (i + 3) < len; i = i + 4) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const p2 = points[i + 2];
        const p3 = points[i + 3];
        path += "M " + p0.x + " " + p0.y;
        path += "L " + p1.x + " " + p1.y;
        path += "L " + p2.x + " " + p2.y;
        path += "L " + p3.x + " " + p3.y;
        path += "Z"
    }
    return path;
}

export function throttle<T extends (...args: any[]) => void> (func: T, delay: number): T {
    let timerId: any = null;
    return function (...args: any[]) {
        if (!timerId) {
            timerId = setTimeout(() => {
                func();
                timerId = null;
            }, delay);
        }
    } as T;
}