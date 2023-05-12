import { Context } from "@/context";
import { XY } from "@/context/selection";
import { translate, expandTo, translateTo } from "@kcdesign/data/editor/frame";

interface Wheel {
    remove: () => undefined
    moving: (event: MouseEvent) => boolean;
}
interface Area {
    top: number
    right: number
    bottom: number
    left: number
}
interface Effects {
    before?: (context: Context) => void;
    rolling?: (context: Context, dx: number, dy: number, setupPint?: XY, curPoint?: XY) => void;
    tail?: (context: Context) => void;
}

// 车轮滚滚🚗，return一个轮子，在该滚动的时候滚动(目前指鼠标脱离innerArea时)，滚动时可以根据传入的effects干一些调用者想要它干的的事情...
function fourWayWheel(context: Context, effects?: Effects, setupPoint?: XY): Wheel {
    const workspace = context.workspace, selection = context.selection;
    const innerArea: Area = { top: 0, right: 0, bottom: 0, left: 0 };
    let op = 'inner'; // 原先所处的区域
    let np = 'inner'; // 现在所处的区域
    let timer: any = null;
    const period: number = 6; // 帧率 1000 / period; (这里的帧率指fireNotify调用的次数)
    const step: number = 6; // 每秒滚动的距离为 (1000 / period) * step * 单位
    const startPoint: XY = { x: 0, y: 0 }; // 安装轮子的位置（坐标系：Page）
    let curPoint: XY = { x: 0, y: 0 }; // 鼠标当前的位置（坐标系：Page）
    function setup() {
        // 根据contentView的Dom bounding生成一个内圈区域（这个内圈区域有一个宽度为padding的内圈缩减），在这内圈区域内，不会触发page滚动;
        const { x, y, bottom, right } = workspace.root, padding = 5;
        innerArea.top = y + padding;
        innerArea.right = right - padding;
        innerArea.bottom = bottom - padding;
        innerArea.left = x + padding;
        if (setupPoint) {
            startPoint.x = setupPoint.x, startPoint.y = setupPoint.y;
        }
        effects?.before && effects.before(context);
        // console.log('-wheel setup-');
    }
    // retrun isOut; 如果你要是出去了你可要告诉别人
    function moving(event: MouseEvent): boolean { // 鼠标移动触发
        let isOut: boolean = false;
        const { clientX, clientY } = event;
        const { top, right, bottom, left } = innerArea;
        let hp: string = ''; // 水平方位
        let vp: string = ''; // 垂直方位
        if (clientX > left && clientX < right && clientY > top && clientY < bottom) {
            np = 'inner';
        } else {
            isOut = true;
            if (clientX <= left) {
                hp = 'left';
            } else if (clientX >= right) {
                hp = 'right';
            }
            if (clientY <= top) {
                vp = 'top';
            } else if (clientY >= bottom) {
                vp = 'bottom';
            }
            np = `${hp}-${vp}`;

        }
        const { x: wx, y: wy } = workspace.root;
        curPoint = workspace.matrix.inverseCoord(clientX - wx, clientY - wy);
        if (np !== op) {
            clearInterval(timer);
            timer = null;
            if (np !== 'inner') {
                const { dx, dy } = getTxybyNp(np, step);
                timer = setInterval(() => {
                    workspace.matrix.trans(dx, dy); // 这里的dx,dy呢，固定单位为 1 * px
                    workspace.matrixTransformation();
                    curPoint = workspace.matrix.inverseCoord(clientX - wx, clientY - wy); // 这边还有一点问题，先放一下！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！
                    // #region 这个区域为动态副作用区域：滚动是一定要滚动的，至于滚动要伴随什么变化，交给传进来的effects?.rolling
                    if (effects?.rolling) {
                        effects.rolling(context, dx, dy, startPoint, curPoint);
                    }
                    // #endregion
                }, period)
            }
            // console.log('所处区域发生变化了', `${op} -> ${np}`);
            op = np;
        }
        return isOut;
    }

    function remove() {
        clearInterval(timer);
        timer = null;
        effects?.tail && effects.tail(context);
        // console.log('-wheel remove-');
        return undefined;
    }
    setup();
    return { remove, moving }
}

// for CtrlRect
function forCtrlRect(context: Context, dx: number, dy: number) {
    const m = context.workspace.matrix;
    dx = dx / m.m00, dy = dy / m.m00; // 这里的dx,dy呢，单位动态，为 1 * (matrix value) * px;
    const shapes = context.selection.selectedShapes;
    for (let i = 0; i < shapes.length; i++) {
        const item = shapes[i];
        translate(item, -dx, -dy);
    }
    context.repo.transactCtx.fireNotify(); // 要更新页面的啦
}
function getTxybyNp(np: string, step: number): { dx: number, dy: number } {
    let dx = 0, dy = 0;
    if (np.includes('right')) {
        dx = -step;
    } else if (np.includes('left')) {
        dx = step;
    }
    if (np.includes('bottom')) {
        dy = -step;
    } else if (np.includes('top')) {
        dy = step;
    }
    return { dx, dy };
}
function isDrag(n: XY, o: XY, threshold: number = 3) {
    const dx = n.x - o.x;
    const dy = n.y - o.y;
    const diff = Math.hypot(dx, dy);
    return diff > threshold;
}
// for new shape
function forNewShape(context: Context, dx: number, dy: number, setupPint?: XY, curPoint?: XY) {
    const newShape = context.selection.selectedShapes[0];
    if (newShape && setupPint && curPoint) {
        const { x: sx, y: sy } = setupPint;
        const { x: px, y: py } = curPoint;
        const x1 = { x: Math.min(sx, px), y: Math.min(sy, py) };
        const x2 = { x: Math.max(sx, px), y: Math.max(sy, py) };
        const height = x2.y - x1.y;
        const width = x2.x - x1.x;
        expandTo(newShape, width, height);
        translateTo(newShape, x1.x, x1.y);
    }
    context.repo.transactCtx.fireNotify(); // 要更新页面的啦
}
export { Wheel, fourWayWheel, forCtrlRect, isDrag, forNewShape }