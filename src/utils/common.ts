import { XY } from '@/context/selection';
import { v4 as uuid } from "uuid";
import { debounce } from 'lodash';
// 打印
function _debounceLog(mes: any, flag?: string) {
  console.log(flag ? `${flag} ${mes}` : mes);
}
export const debounceLog = debounce(_debounceLog, 300);
// 简易id
export function simpleId(): string {
  return uuid().split('-')[3];
}
// 获取Select的options
export function genOptions(items: string[][]) {
  return items.map((item: string[], index: number) => {
    return {
      id: index,
      data: {
        value: item[0],
        content: item[1]
      }
    }
  })
}

// 获取两条直线的夹角
export function getAngle(line1: [number, number, number, number], line2: [number, number, number, number]): number {
  const slope1 = Math.abs((line1[3] - line1[1]) / (line1[2] - line1[0])) === Infinity ? 0 : (line1[3] - line1[1]) / (line1[2] - line1[0]);
  const slope2 = Math.abs((line2[3] - line2[1]) / (line2[2] - line2[0])) === Infinity ? 0 : (line2[3] - line2[1]) / (line2[2] - line2[0]);
  const angleRad = Math.atan((slope2 - slope1) / (1 + slope1 * slope2));
  return angleRad * (180 / Math.PI);
}
// 根据四个点生成一个矩形
// p1 p2
// p4 p3
export function createRect(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number) {
  const left = Math.min(x1, x2, x3, x4);
  const top = Math.min(y1, y2, y3, y4);
  const right = Math.max(x1, x2, x3, x4);
  const bottom = Math.max(y1, y2, y3, y4);

  const width = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  const height = Math.sqrt(Math.pow(x3 - x2, 2) + Math.pow(y3 - y2, 2));

  const angle = getHorizontalAngle({ x: x1, y: y1 }, { x: x2, y: y2 });

  const transX = ((right - left) - width) / 2;
  const transY = ((bottom - top) - height) / 2;
  const transform = `transform: translate(${transX}px, ${transY}px) rotate(${angle}deg);`
  return "position: absolute; " +
    `left: ${left}px; ` +
    `top: ${top}px; ` +
    `width: ${width}px; ` +
    `height: ${height}px; ` +
    transform;
}
// 根据四个点生成一条线
// p1 p2
// p4 p3
export function createLine(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number) {
  const left = Math.min(x1, x2, x3, x4);
  const top = Math.min(y1, y2, y3, y4);
  const right = Math.max(x1, x2, x3, x4);
  const bottom = Math.max(y1, y2, y3, y4);

  const lineThick = 14; // 线条控件实际宽度

  const width = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  const height = Math.sqrt(Math.pow(x3 - x2, 2) + Math.pow(y3 - y2, 2));

  const length = Math.sqrt(Math.pow(x3 - x1, 2) + Math.pow(y3 - y1, 2));

  const angle = getHorizontalAngle({ x: x1, y: y1 }, { x: x3, y: y3 });

  const transY = (((bottom - top) - height) + (height - lineThick)) / 2;
  const transX = (((right - left) - width) + (width - length)) / 2;
  const transform = `transform: translate(${transX}px, ${transY}px) rotate(${angle}deg);`
  return "position: absolute; " +
    `left: ${left}px; ` +
    `top: ${top}px; ` +
    `width: ${length}px; ` +
    `height: ${lineThick}px; ` +
    transform;
}

// 根据矩形的四个点获取其中心轴
// p1 p2
// p4 p3
export function getAxle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): XY {
  const left = Math.min(x1, x2, x3, x4);
  const top = Math.min(y1, y2, y3, y4);
  const right = Math.max(x1, x2, x3, x4);
  const bottom = Math.max(y1, y2, y3, y4);
  return { x: (left + right) / 2, y: (top + bottom) / 2 };
}

// 根据矩形的三个点，获取矩形宽高
// p1 p2
// p4 p3
export function getRectWH(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) {
  const width = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  const height = Math.sqrt(Math.pow(x3 - x2, 2) + Math.pow(y3 - y2, 2));
  return { width, height }
}

// 获取直线的水平夹角
export function getHorizontalAngle(A: { x: number, y: number }, B: { x: number, y: number }) {
  const deltaX = B.x - A.x;
  const deltaY = B.y - A.y;
  const angleInDegrees = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
  const angle = (angleInDegrees + 360) % 360;
  return angle;
}

// 根据若干个点[x, y]，确定最边界的四个点
export function createHorizontalBox(points: [number, number][]) {
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i < points.length; i++) {
    xs.push(points[i][0]);
    ys.push(points[i][1]);
  }
  const top = Math.min(...ys);
  const bottom = Math.max(...ys);
  const left = Math.min(...xs);
  const right = Math.max(...xs);
  return { top, bottom, left, right };
}

// 根据若干个点{x, y}，确定最边界的四个点
export function XYsBounding(points: XY[]) {
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i < points.length; i++) {
    xs.push(points[i].x);
    ys.push(points[i].y);
  }
  const top = Math.min(...ys);
  const bottom = Math.max(...ys);
  const left = Math.min(...xs);
  const right = Math.max(...xs);
  return { top, bottom, left, right };
}

// 判断线段p1q1与线段p2q2是否🍌
export function isIntersect(p1: XY, q1: XY, p2: XY, q2: XY): boolean {
  const orientation1 = pointOrientation(p1, q1, p2);
  const orientation2 = pointOrientation(p1, q1, q2);
  const orientation3 = pointOrientation(p2, q2, p1);
  const orientation4 = pointOrientation(p2, q2, q1);

  if (orientation1 !== orientation2 && orientation3 !== orientation4) {
    return true;
  }
  if (orientation1 === 0 && isOnSegment(p1, p2, q1)) {
    return true;
  }
  if (orientation2 === 0 && isOnSegment(p1, q2, q1)) {
    return true;
  }
  if (orientation3 === 0 && isOnSegment(p2, p1, q2)) {
    return true;
  }
  if (orientation4 === 0 && isOnSegment(p2, q1, q2)) {
    return true;
  }
  return false;

  function pointOrientation(p1: XY, p2: XY, p3: XY) {
    const val = (p2.y - p1.y) * (p3.x - p2.x) - (p2.x - p1.x) * (p3.y - p2.y);
    if (val == 0) {
      return 0;
    }
    return (val > 0) ? 1 : 2;

  }
  function isOnSegment(p: XY, q: XY, r: XY) {
    if (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
      q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y)) {
      return true;
    }
    return false;
  }
}

// 判断形状是否被包涵
export function isIncluded(selectorPoints: [XY, XY, XY, XY, XY], shapePoints: XY[]): boolean {
  const left = selectorPoints[0].x, top = selectorPoints[0].y, right = selectorPoints[2].x, bottom = selectorPoints[2].y;
  const { left: l, top: t, right: r, bottom: b } = XYsBounding(shapePoints);
  return l > left && r < right && t > top && b < bottom;
}

// 两个形状既不🍌也没有包含关系，返回false
export function isTarget(selectorPoints: [XY, XY, XY, XY, XY], shapePoints: XY[], includes?: boolean) {
  if (isIncluded(selectorPoints, shapePoints)) {
    return true
  }
  if (includes) return false;
  let s = 0;
  while (s < selectorPoints.length - 1) {
    const p1 = selectorPoints[s], q1 = selectorPoints[s + 1];

    if (shapePoints.length === 2) { // 线条
      if (isIntersect(p1, q1, shapePoints[0], selectorPoints[1])) {
        return true;
      }
    } else {
      for (let i = 0; i < shapePoints.length - 1; i++) {
        const p2 = shapePoints[i], q2 = shapePoints[i + 1];
        if (isIntersect(p1, q1, p2, q2)) {
          return true;
        }
      }
    }
    s++;
  }
  return false;
}
export function is_mac() {
  return /macintosh|mac os x/i.test(navigator.userAgent);
}
export function string_by_sys(str: string): string {
  if (is_mac()) {
    return str.replace(/ctrl|Ctrl/g, "⌘").replace(/shift|Shift/g, "⇧").replace(/alt|Alt/g, "⌥");
  } else {
    return str;
  }
}
