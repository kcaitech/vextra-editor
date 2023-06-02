import { XY, PageXY } from '@/context/selection';
import { Matrix, ShapeFrame, Shape, ShapeType } from '@kcdesign/data';
import { isTarget } from './common';
import { Context } from '@/context';
import { Action } from '@/context/workspace';
// 寻找一块空白的区域；
// 先寻找当前编辑器中心center在page上的位置，center、pageMatrix -> XY;
// 以XY为start点，在start处建立一个width、height的矩形，在这里会获得isTarget的第一个传参selectorPoints，与所有图形Shapes(只要page的子元素就行)匹配是否🍌，一旦有图形🍌则XY向右移动offset = 40px；
// 直到没有🍌为止，得到最后的XY;

export function landFinderOnPage(pageMatrix: Matrix, context: Context, frame: ShapeFrame): PageXY {
    const shapes: Shape[] = context.selection.selectedPage?.childs || [];
    const { width, height } = frame;
    let center = context.workspace.root.center;
    center = pageMatrix.inverseCoord(center.x, center.y);
    const start = { x: center.x - width / 2, y: center.y - height / 2 }; // get start point
    const offset = 40;
    let pure: boolean = false;
    let max = 0;
    while (!pure && max <= 100000) {
        pure = true;
        const { x: sx, y: sy } = start, w = width, h = height;
        const selectorPoints: [XY, XY, XY, XY, XY] = [
            { x: sx, y: sy },
            { x: sx + w, y: sy },
            { x: sx + w, y: sy + h },
            { x: sx, y: sy + h },
            { x: sx, y: sy },
        ];

        for (let i = 0; i < shapes.length; i++) {
            const m = shapes[i].matrix2Page();
            const { width: w, height: h } = shapes[i].frame;
            const ps: XY[] = [
                { x: 0, y: 0 },
                { x: w, y: 0 },
                { x: w, y: h },
                { x: 0, y: h },
                { x: 0, y: 0 },
            ].map(p => m.computeCoord(p.x, p.y));
            if (isTarget(selectorPoints, ps)) {
                pure = false; // 存在🍌，不是净土！
            }
        }
        !pure && (start.x += offset); // 不是净土，挪一下，再找。
        max++;
    }
    if (max === 100000) {
        throw new Error('overflow');
    }
    return start; // 找到了净土的起点
}

// 使容器滚动到可视区域
export function scrollToContentView(shape: Shape, context: Context) {
    const selection = context.selection, workspace = context.workspace;
    const { x: sx, y: sy, height, width } = shape.frame2Page();
    const shapeCenter = workspace.matrix.computeCoord(sx + width / 2, sy + height / 2);
    const contentViewCenter = workspace.root.center;
    const transX = contentViewCenter.x - shapeCenter.x, transY = contentViewCenter.y - shapeCenter.y;
    if (transX || transY) {
        selection.unHoverShape();
        selection.selectShape();
        const pageViewEl = workspace.pageView;
        if (pageViewEl) {
            pageViewEl.classList.add('transition-400');
            workspace.matrix.trans(transX, transY);
            const timer = setTimeout(() => {
                selection.selectShape(shape);
                pageViewEl.classList.remove('transition-400');
                clearTimeout(timer);
            }, 400);
        } else {
            workspace.matrix.trans(transX, transY);
        }
        workspace.matrixTransformation();
    }
}

export function insertFrameTemplate(context: Context, name: string) {
    const selection = context.selection, workspace = context.workspace;
    const shapes: Shape[] = selection.selectedPage?.childs || [];
    const type = ShapeType.Artboard;
    const parent = selection.selectedPage;
    if (parent) {
        const editor = context.editor.editor4Page(parent);
        const { width, height } = workspace.frameSize;
        const matrix = workspace.matrix;
        const frame = new ShapeFrame(0, 0, width, height);
        const { x, y } = landFinderOnPage(matrix, context, frame);
        frame.x = x, frame.y = y;
        let artboard: Shape | false = editor.create(type, name, frame);
        artboard = editor.insert(parent, shapes.length, artboard);
        if (artboard) {
            const timer = setTimeout(() => {
                artboard && scrollToContentView(artboard, context);
                clearTimeout(timer);
            }, 100)
        }
    }
    workspace.setAction(Action.AutoV);
}