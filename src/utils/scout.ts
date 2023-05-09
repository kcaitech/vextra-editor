import { XY } from "@/context/selection";
import { v4 as uuid } from "uuid";

interface Scout {
    path: SVGPathElement,
    remove: () => void;
    isPointInShape: (d: string, point: XY) => boolean;
}
// 蜘蛛侦探🕷：实现原理为动态修改path路径对象的d属性。返回一个Scout对象， scout.isPointInShape(d, SVGPoint)用于判断一个点(SVGPoint)是否在一条闭合路径(d)上
function scout(): Scout {
    const scoutId = (uuid().split('-').at(-1)) || 'scout';
    const pathId = (uuid().split('-').at(-1)) || 'path';
    const ele: SVGElement = createSVGGeometryElement(scoutId);
    const path = createPath('M 0 0 l 2 0 l 2 2 l -2 0 z', pathId);
    ele.appendChild(path);
    document.body.appendChild(ele);

    const SVGPoint = document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGPoint();

    function remove() {
        const s = document.querySelector(`[id="${scoutId}"]`);
        if (s) {
            document.removeChild(s)
        }
    }
    function isPointInShape(d: string, point: XY): boolean {
        SVGPoint.x = point.x, SVGPoint.y = point.y;
        path.setAttributeNS(null, 'd', d);
        // console.log('path', path);
        // console.log('isPointInFill - path', (path as SVGGeometryElement).isPointInFill(SVGPoint));
        return (path as SVGGeometryElement).isPointInFill(SVGPoint);
    }
    return { path, remove, isPointInShape }
}

function createSVGGeometryElement(id: string): SVGElement {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute('width', '10');
    svg.setAttribute('height', '10');
    svg.setAttribute('id', id);
    return svg;
}
function createPath(path: string, id: string): SVGPathElement {
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttributeNS(null, 'd', path);
    p.setAttributeNS(null, 'fill', 'red');
    p.setAttribute('id', id);
    return p;
}
export { Scout, scout }