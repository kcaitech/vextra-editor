import { Context } from "@/context";
import { Shape } from "@kcdesign/data/data/shape";
import { translate } from "@kcdesign/data/editor/frame";

interface Wheel {
    remove: () => undefined
    moving: (event: MouseEvent) => void
}
interface Area {
    top: number
    right: number
    bottom: number
    left: number
}
// 车轮滚滚函数，return一个轮子，在该滚动的时候滚动(目前指鼠标脱离innerArea时)，滚动时可以根据传入的callback干一些其他调用者想要它干的的事情...
function fourWayWheel(context: Context, callbacks?: Function[]): Wheel {
    const workspace = context.workspace, selection = context.selection;
    const innerArea: Area = { top: 0, right: 0, bottom: 0, left: 0 };
    let op = 'inner'; // 原先所处的区域
    let np = 'inner'; // 现在所处的区域
    let timer: any = null;
    const period: number = 8;
    const step: number = 3; // 每秒滚动的距离为 1000 / 8 * 3

    function setup() {
        // 根据contentView的Dom bounding生成一个内圈区域（这个内圈区域有一个宽度为padding的内圈缩减），在这内圈区域内，不会触发page滚动
        const { x, y, bottom, right } = workspace.root, padding = 5;
        innerArea.top = y + padding;
        innerArea.right = right - padding;
        innerArea.bottom = bottom - padding;
        innerArea.left = x + padding;
    }
    // retrun isOut;
    function moving(event: MouseEvent): boolean {
        let isOut: boolean = false;
        const { clientX, clientY } = event;
        const { top, right, bottom, left } = innerArea;
        let hp: string = ''; // 水平方位
        let vp: string = ''; // 垂直方位
        if (clientX > left && clientX < right && clientY > top && clientY < bottom) {
            np = 'inner';
        } else {
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
            np = `${hp}-${vp}`
        }
        if (np !== op) {
            clearInterval(timer);
            timer = null;
            if (np !== 'inner') {
                isOut = true;
                const { dx, dy } = getTxybyNp(np, step);
                timer = setInterval(() => {
                    workspace.matrix.trans(dx, dy);
                    workspace.matrixTransformation();
                    // #region 这个区域为动态副作用区域：滚动是一定要滚动的，至于滚动要伴随什么变化，交给传进来的callback
                    forCtrlRect(context.selection.selectedShapes, dx, dy);
                    context.repo.transactCtx.fireNotify(); // 要更新页面的啦
                    // #endregion
                }, period)
            }
            op = np;
        }
        return isOut;
    }

    function remove() {
        clearInterval(timer);
        timer = null;
        return undefined;
    }
    setup();
    return { remove, moving }
}

// for CtrlRect
function forCtrlRect(shapes: Shape[], dx: number, dy: number) {
    for (let i = 0; i < shapes.length; i++) {
        const item = shapes[i];
        translate(item, -dx, -dy);
    }
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

export { Wheel, fourWayWheel }