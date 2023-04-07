/**
 * 标准矩阵
 *  1  0  0
 *  0  1  0
 *  0  0  1
 * https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform-function/matrix
 * 对应数组下标
 *  0  2  4
 *  1  3  5
 * -1 -1 -1
 */
function __multi(lhs: number[], rhs: number[]): number[] {
    return [
        lhs[0] * rhs[0] + lhs[2] * rhs[1], lhs[0] * rhs[2] + lhs[2] * rhs[3],
        lhs[1] * rhs[0] + lhs[3] * rhs[1], lhs[1] * rhs[2] + lhs[3] * rhs[3],
        lhs[0] * rhs[4] + lhs[2] * rhs[5] + lhs[4], lhs[1] * rhs[4] + lhs[3] * rhs[5] + lhs[5]
    ]
}

export class Matrix {
    private m_matrix: number[];

    constructor()
    constructor(m: number[] | Matrix)
    constructor(m0: number, m1: number, m2: number, m3: number, m4: number, m5: number)
    constructor(...args: any) {
        this.m_matrix = args.length === 0 ? [1, 0, 0, 1, 0, 0] :
            (args[0] instanceof Array ? args[0] : 
                (args[0] instanceof Matrix ? this.m_matrix = args[0].toArray() : [...args]));
    }

    multi(m: number[]): void
    multi(m: Matrix): void
    multi(m: any): void { // 左乘
        const m0 = this.m_matrix;
        const mm = m instanceof Matrix ? m.m_matrix : m;
        this.m_matrix = __multi(mm, m0);
    }

    preMulti(m: number[]): void
    preMulti(m: Matrix): void
    preMulti(m: any): void { // 左乘
        const m0 = this.m_matrix;
        const mm = m instanceof Matrix ? m.m_matrix : m;
        this.m_matrix = __multi(m0, mm);
    }

    trans(x: number, y: number) {
        this.multi([1, 0, 0, 1, x, y]);
    }
    preTrans(x: number, y: number) {
        this.preMulti([1, 0, 0, 1, x, y]);
    }
    scale(s: number) {
        this.multi([s, 0, 0, s, 0, 0]);
    }
    computeCoord(x: number, y: number) {
        const m = this.m_matrix
        return { x: m[0] * x + m[2] * y + m[4], y: m[1] * x + m[3] * y + m[5] };
    }

    get inverse() {
        const m = this.m_matrix;
        const d = m[0] * m[3] - m[1] * m[2];
        return [
            m[3] / d, - m[1] / d,
            - m[2] / d, m[0] / d,
            (m[2] * m[5] - m[4] * m[3]) / d,
            (m[1] * m[4] - m[5] * m[0]) / d
        ];
    }
    inverseCoord(x: number, y: number) {
        const m = this.inverse
        return { x: m[0] * x + m[2] * y + m[4], y: m[1] * x + m[3] * y + m[5] };
    }

    reset(): void
    reset(m: number[] | Matrix): void
    reset(m0: number, m1: number, m2: number, m3: number, m4: number, m5: number): void
    reset(...args: any): void {
        this.m_matrix = args.length === 0 ? [1, 0, 0, 1, 0, 0] :
            (args[0] instanceof Array ? args[0] : 
                (args[0] instanceof Matrix ? this.m_matrix = args[0].toArray() : [...args]));
    }

    toString() {
        return 'matrix(' + this.m_matrix.join(',') + ')';
    }
    toArray() {
        return this.m_matrix.slice(0);
    }
}
