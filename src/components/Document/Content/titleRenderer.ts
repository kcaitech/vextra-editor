import { Context } from "@/context";
import {
    ColVector3D,
    makeMatrixByTransform2,
    makeShapeTransform2By1,
    Matrix2,
    NumberArray2D,
    ShapeView,
    Transform
} from "@kcdesign/data";
import { isShapeOut } from "@/utils/assist";
import { cursorAngle } from "@/components/Document/Selection/common";

export interface TitleAttri {
    id: string;
    name: string;
    width: number;
    shape: ShapeView;
    active: boolean;
    transform: string;
}

export class TitleRenderer {
    private readonly m_context: Context;
    private readonly m_title_list: TitleAttri[];
    private readonly m_title_map: Map<string, TitleAttri>;

    constructor(context: Context, titleList: TitleAttri[]) {
        this.m_context = context;

        this.m_title_list = titleList;
        this.m_title_map = new Map([]);
        const map = this.m_title_map;
        titleList.forEach(t => {
            map.set(t.id, t);
        });
    }

    // 已监听的Container对象
    private underRootContainerMap = new Map<string, ShapeView>();
    // 对象监听卸载函数集合
    private watcherUninstallerMap = new Map<string, () => void>();

    private generate(shape: ShapeView) {
        if (isShapeOut(this.m_context, shape)) {
            return;
        }

        const titleCtx: TitleAttri = {
            id: shape.id,
            name: shape.name,
            width: 56,
            shape,
            active: false,
            transform: ''
        };

        this.modifyTransformStr(titleCtx);

        this.m_title_list.push(titleCtx);
        this.m_title_map.set(shape.id, titleCtx);
    }

    private modifyTransformStr(titleCtx: TitleAttri) {
        const { shape } = titleCtx;

        const { width, height } = shape.size;

        const fromRoot = shape.transform2FromRoot;
        const clientMatrix = makeShapeTransform2By1(this.m_context.workspace.matrix);

        const fromClient = fromRoot.clone()
            .addTransform(clientMatrix);

        const points = fromClient.transform([
            ColVector3D.FromXY(0, 0),
            ColVector3D.FromXY(width, 0),
            ColVector3D.FromXY(width, height),
            ColVector3D.FromXY(0, height)
        ]);

        const {
            col0: lt,
            col1: rt,
            col2: rb,
            col3: lb
        } = points;

        const s1 = [lt, rt];
        const s2 = [rt, rb];
        const s3 = [rb, lb];
        const s4 = [lb, lt];

        let top;
        let topValue = Infinity;

        const t1 = (s1[0].y + s1[1].y) / 2;
        if (t1 < topValue) {
            topValue = t1;
            top = s1;
        }

        const t2 = (s2[0].y + s2[1].y) / 2;
        if (t2 < topValue) {
            topValue = t2;
            top = s2;
        }

        const t3 = (s3[0].y + s3[1].y) / 2;
        if (t3 < topValue) {
            topValue = t3;
            top = s3;
        }

        const t4 = (s4[0].y + s4[1].y) / 2;
        if (t4 < topValue) {
            top = s4;
        }

        let xAxis: [ColVector3D, ColVector3D];
        let yAxis: [ColVector3D, ColVector3D];
        let O: ColVector3D;

        // Top 边在上面
        if (top === s1) {
            let start = lt;
            if (rt.x < lt.x) {
                start = rt;
            }

            if (start === lt) {
                xAxis = [lt, rt];
                yAxis = [lt, lb];
                O = lt;
            } else {
                xAxis = [rt, lt];
                yAxis = [rt, rb];
                O = rt;
            }
        } else if (top === s2) {
            let start = rt;
            if (rb.x < rt.x) {
                start = rb;
            }

            if (start === rt) {
                xAxis = [rt, rb];
                yAxis = [rt, lt];
                O = rt;
            } else {
                xAxis = [rb, rt];
                yAxis = [rb, lb];
                O = rb;
            }
        } else if (top === s3) {
            let start = rb;
            if (lb.x < rb.x) {
                start = lb;
            }

            if (start === rb) {
                xAxis = [rb, lb];
                yAxis = [rb, rt];
                O = rb;
            } else {
                xAxis = [lb, rb];
                yAxis = [lb, lt];
                O = lb;
            }
        } else {
            let start = lb;
            if (lt.x < lb.x) {
                start = lt;
            }

            if (start === lb) {
                xAxis = [lb, lt];
                yAxis = [lb, rb];
                O = lb;
            } else {
                xAxis = [lt, lb];
                yAxis = [lt, rt];
                O = lt;
            }
        }

        const X = xAxis[1].clone().subtract(xAxis[0]);
        const Y = yAxis[1].clone().subtract(yAxis[0]);

        const tDirection = new Transform({
            matrix: new Matrix2(new NumberArray2D([4, 4], [
                X.x, Y.x, 0, 0,
                X.y, Y.y, 0, 0,
                X.z, Y.z, 1, 0,
                0, 0, 0, 1,
            ]))
        }).clearSkew().transform(ColVector3D.FromXY(0, -1)).col0;

        const OT = new Transform()
            .setRotateZ(cursorAngle(ColVector3D.FromXY(1, 0), X))
            .setTranslate(O)
            .translateAt({
                axis: tDirection,
                distance: 20,
            });

        titleCtx.transform = makeMatrixByTransform2(OT).toString();
    }

    private updateContainerTitle(id: string, args: any[]) {
        // console.log('args:', args);
        if (!args?.includes('layout')) {
            return;
        }

        // todo 这里双数据结构没有起到作用，后续想办法解决一下

        // const titleCtx = this.m_title_map.get(id);
        // if (!titleCtx) {
        //     return;
        // }

        const titleCtx = this.m_title_list.find(t => t.id === id);
        if (!titleCtx) {
            return;
        }

        this.modifyTransformStr(titleCtx);
    }

    fullUpdate() {
        this.m_title_list.length = 0;
        this.m_title_map.clear();

        this.underRootContainerMap.forEach((shape) => {
            this.generate(shape);
        });
    }

    updateUnderRootContainerMap() {
        const ctx = this.m_context;
        const page = ctx.selection.selectedPage!;
        const children = page.childs;

        const URCM = this.underRootContainerMap;
        const WUM = this.watcherUninstallerMap;
        const UCT = this.updateContainerTitle.bind(this);

        URCM.clear();

        for (let i = children.length - 1; i > -1; i--) {
            const c = children[i];

            if (!c.isContainer) {
                continue;
            }

            URCM.set(c.id, c);

            if (!WUM.has(c.id)) {
                WUM.set(c.id, c.watch((...args) => {
                    UCT(c.id, args);
                }));
            }
        }

        WUM.forEach((stopFunc, key) => {
            if (!URCM.has(key)) {
                stopFunc();
                WUM.delete(key);
            }
        });

        const added = new Set<string>();

        const list = this.m_title_list;
        const map = this.m_title_map;

        const temp = [...list];

        list.length = 0;
        map.clear();

        for (let i = 0; i < temp.length; i++) {
            const c = temp[i];

            if (URCM.has(c.id)) {
                list.push(c);
                map.set(c.id, c);
                added.add(c.id);
            }
        }

        URCM.forEach((shape) => {
            if (!added.has(shape.id)) this.generate(shape);
        });

        console.log('__TITLE_LAYOUT_FINISH__', URCM.size, this.m_title_map.size, this.m_title_list);
    }

    clearContainerWatcher() {
        this.watcherUninstallerMap.forEach((stopFunc) => {
            stopFunc();
        })

        this.watcherUninstallerMap.clear();
    }
}