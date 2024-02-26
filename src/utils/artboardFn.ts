import { XY, PageXY } from '@/context/selection';
import { Matrix, ShapeFrame, Shape, ShapeType, GroupShape, Artboard, ShapeView, GroupShapeView } from '@kcdesign/data';
import { isTarget, isTarget2 } from './common';
import { Context } from '@/context';
import { Action, Tool } from '@/context/tool';
import { compare_layer_3 } from './group_ungroup';
import { WorkSpace } from '@/context/workspace';
// 寻找一块空白的区域；
// 先寻找当前编辑器中心center在page上的位置，center、pageMatrix -> XY;
// 以XY为start点，在start处建立一个width、height的矩形，在这里会获得isTarget的第一个传参selectorPoints，与所有图形Shapes(只要page的子元素就行)匹配是否🍌，一旦有图形🍌则XY向右移动offset = 40px；
// 直到没有🍌为止，得到最后的XY;

export function landFinderOnPage(pageMatrix: Matrix, context: Context, frame: ShapeFrame): PageXY {
    const shapes: ShapeView[] = context.selection.selectedPage?.childs || [];
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
            const m = shapes[i].matrix2Root();
            const { width: w, height: h } = shapes[i].frame;
            const ps: XY[] = [
                { x: 0, y: 0 },
                { x: w, y: 0 },
                { x: w, y: h },
                { x: 0, y: h },
                { x: 0, y: 0 },
            ].map(p => m.computeCoord2(p.x, p.y));
            if (isTarget(selectorPoints, ps) || isTarget(ps as [XY, XY, XY, XY, XY], selectorPoints)) pure = false; // 存在🍌
        }
        !pure && (start.x += offset); // 挪一下，再找。
        max++;
    }
    if (max === 100000) {
        throw new Error('overflow');
    }
    return start; // 找到了空白区域的起点
}

// 使容器滚动到可视区域
export function scrollToContentView(shape: ShapeView, context: Context) {
    const selection = context.selection, workspace = context.workspace;
    const m2r = shape.matrix2Root(), f = shape.frame;
    m2r.multiAtLeft(workspace.matrix);
    const lt = m2r.computeCoord2(0, 0);
    const rb = m2r.computeCoord2(f.width, f.height);
    const w = rb.x - lt.x, h = rb.y - lt.y;
    const shapeCenter = { x: lt.x + w / 2, y: lt.y + h / 2 };
    const contentViewCenter = workspace.root.center;
    const transX = contentViewCenter.x - shapeCenter.x, transY = contentViewCenter.y - shapeCenter.y;
    if (transX || transY) {
        selection.unHoverShape();
        selection.selectShape();
        context.tool.setTitleVisible(false);
        const pageViewEl = workspace.pageView;
        if (pageViewEl) {
            pageViewEl.classList.add('transition-400');
            const m = new Matrix(workspace.matrix);
            m.trans(transX, transY);
            const root = workspace.root;
            const w_max = root.width;
            const h_max = root.height;
            const ratio_w = w / w_max * 1.06; // 两边留点空白
            const ratio_h = h / h_max * 1.12;
            const ratio = Math.max(ratio_h, ratio_w);
            if (ratio > 1) {
                m.trans(-root.width / 2, -root.height / 2);
                m.scale(1 / ratio);
                m.trans(root.width / 2, root.height / 2);
            }
            workspace.matrix.reset(m);
            const timer = setTimeout(() => {
                selection.selectShape(shape);
                context.tool.setTitleVisible(true);
                pageViewEl.classList.remove('transition-400');
                clearTimeout(timer);
            }, 400);
        } else {
            workspace.matrix.trans(transX, transY);
        }
        workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
    }
}

export function insertFrameTemplate(context: Context) {
    const selection = context.selection, workspace = context.workspace, tool = context.tool;
    const shapes: ShapeView[] = selection.selectedPage?.childs || [];
    const type = ShapeType.Artboard;
    const parent = selection.selectedPage;
    if (parent) {
        const editor = context.editor4Page(parent);
        const tf = tool.frameSize
        const matrix = workspace.matrix;
        const frame = new ShapeFrame(0, 0, tf.size.width, tf.size.height);
        const { x, y } = landFinderOnPage(matrix, context, frame);
        frame.x = x, frame.y = y;
        // let artboard: Shape | false = editor.createArtboard(tf.name, frame);
        let artboard: Shape | false = editor.create(ShapeType.Artboard, tf.name, frame);
        artboard = editor.insert(parent.data, shapes.length, artboard);
        context.nextTick(parent, () => {
            if (artboard) {
                const view = parent.shapes.get(artboard.id);
                view && scrollToContentView(view, context);
            }
        })
    }
    context.tool.setAction(Action.AutoV);
}

export function collect(context: Context): ShapeView[] {
    const selection = context.selection;
    const page = selection.selectedPage;
    const artboard = selection.selectedShapes[0];
    if (page && artboard && artboard.type === ShapeType.Artboard) {
        const m2r = artboard.matrix2Root();
        const frame = artboard.frame;
        const ps = [
            { x: 0, y: 0 },
            { x: frame.width, y: 0 },
            { x: frame.width, y: frame.height },
            { x: 0, y: frame.height },
            { x: 0, y: 0 }
        ].map(p => m2r.computeCoord(p.x, p.y));

        const scope = (((artboard.parent || page) as ShapeView).childs || [])
            .filter(i => i.id !== artboard.id);

        return finder(scope, ps as [XY, XY, XY, XY, XY]);
    } else return [];
}

function finder(childs: ShapeView[], Points: [XY, XY, XY, XY, XY]) {
    let ids = 0;
    const selectedShapes: Map<string, ShapeView> = new Map();
    while (ids < childs.length) {
        const shape = childs[ids];
        if (shape.isLocked() || !shape.isVisible()) {
            ids++;
            continue;
        }

        if (shape.type === ShapeType.Artboard) { // 容器要判定为真的条件是完全被选区覆盖
            if (isTarget2(Points, shape, true)) {
                selectedShapes.set(shape.id, shape);
                for (let i = 0; i < (shape).childs.length; i++) {
                    selectedShapes.delete((shape).childs[i].id);
                }
            }
        } else if (isTarget2(Points, shape, true)) {
            selectedShapes.set(shape.id, shape);
        }

        ids++;
    }
    return compare_layer_3(Array.from(selectedShapes.values()));
}

export function get_artboard_list_by_point(context: Context, range: ShapeView[], point: PageXY, init?: ShapeView[]) {
    let result: ShapeView[] = init || [context.selection.selectedPage!];
    const scout = context.selection.scout!;
    for (let i = 0, len = range.length; i < len; i++) {
        const s = range[i];
        if (s.type !== ShapeType.Artboard) continue;
        if (scout.isPointInShape(s, point)) {
            result.push(s);
            if (s.childs && s.childs.length) {
                result = get_artboard_list_by_point(context, s.childs, point, result);
            }
        }
    }
    return result;
}

export function get_common_environment(shapes1: ShapeView[], shapes2: ShapeView[]) {
    let longer = shapes1.length > shapes2.length ? shapes1 : shapes2;
    const anther = longer === shapes1 ? shapes2 : shapes1;
    longer = longer.slice(0, anther.length);
    let result: ShapeView | undefined;
    for (let i = longer.length - 1; i > -1; i--) {
        const a1 = longer[i], a2 = anther[i];
        if (a1.id === a2.id) {
            result = a1;
            break;
        }
    }
    return result;
}