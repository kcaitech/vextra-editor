import { CtrlElementType, Matrix, Shape } from "@kcdesign/data"

interface Dot {
    point: { x: number, y: number }
    extra: { x: number, y: number }
    r: { p: string, transform: string }
    type: CtrlElementType
    type2: CtrlElementType
}
export function update_dot(ps: { x: number, y: number, type?: CtrlElementType }[], s_r: number, matrix: Matrix, shape?: Shape): Dot[] {
    const bit_v = 4;
    const bit_v_d = 7;
    const [lt, rt, rb, lb] = ps;
    const r1 = get_r_path(lt);
    const transform1 = `translate(${lt.x}px, ${lt.y}px) rotate(${-180 + s_r}deg) translate(-${lt.x}px, -${lt.y}px)`;
    const path_obj_1 = { point: { x: lt.x - bit_v, y: lt.y - bit_v }, extra: { x: lt.x - bit_v_d, y: lt.y - bit_v_d }, r: { p: r1, transform: transform1 }, type: CtrlElementType.RectLT, type2: CtrlElementType.RectLTR };
    //rt
    const r2 = get_r_path(rt);
    const transform2 = `translate(${rt.x}px, ${rt.y}px) rotate(${-90 + s_r}deg) translate(-${rt.x}px, -${rt.y}px)`;
    const path_obj_2 = { point: { x: rt.x - bit_v, y: rt.y - bit_v }, extra: { x: rt.x - bit_v_d, y: rt.y - bit_v_d }, r: { p: r2, transform: transform2 }, type: CtrlElementType.RectRT, type2: CtrlElementType.RectRTR };

    //rb
    const r3 = get_r_path(rb);
    const transform3 = `translate(${rb.x}px, ${rb.y}px) rotate(${0 + s_r}deg) translate(-${rb.x}px, -${rb.y}px)`;
    const path_obj_3 = { point: { x: rb.x - bit_v, y: rb.y - bit_v }, extra: { x: rb.x - bit_v_d, y: rb.y - bit_v_d }, r: { p: r3, transform: transform3 }, type: CtrlElementType.RectRB, type2: CtrlElementType.RectRBR };
    //lb
    const r4 = get_r_path(lb);
    const transform4 = `translate(${lb.x}px, ${lb.y}px) rotate(${90 + s_r}deg) translate(-${lb.x}px, -${lb.y}px)`;
    const path_obj_4 = { point: { x: lb.x - bit_v, y: lb.y - bit_v }, extra: { x: lb.x - bit_v_d, y: lb.y - bit_v_d }, r: { p: r4, transform: transform4 }, type: CtrlElementType.RectLB, type2: CtrlElementType.RectLBR };

    return [path_obj_1, path_obj_2, path_obj_3, path_obj_4]
}
function get_r_path(ps: { x: number, y: number }) {
    const bit_v_r = 14;
    return `M${ps.x} ${ps.y} h${bit_v_r} a${bit_v_r} ${bit_v_r} 0 0 1 ${-bit_v_r} ${bit_v_r} z`;
}