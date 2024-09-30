<script setup lang="ts">
import { Context } from '@/context';
import { fixedZero, permIsEdit } from '@/utils/common';
import { checkTidyUpShapesOrder, getSelectedWidthHeight, layoutSpacing, tidyUpShapesOrder } from '@/utils/tidy_up';
import { onMounted, onUnmounted, ref } from 'vue';
import { Point } from '../SelectionView.vue';
import { Selection, XY } from '@/context/selection';
import { ColVector3D, makeShapeTransform2By1, Matrix, ShapeView } from '@kcdesign/data';
import { WorkSpace } from '@/context/workspace';
import { CursorType } from '@/utils/cursor2';
import { LockMouse } from '@/transform/lockMouse';
import { throttle } from 'lodash';
import { TranslateHandler } from '@/transform/translate';
import { Attribute } from '@/context/atrribute';
interface Props {
    context: Context
    controllerFrame: Point[];
}
const props = defineProps<Props>();
const isHover = ref(false);
const isTidyUp = ref(true);
const dots = ref<{ x: number, y: number, dot: boolean, shape: ShapeView }[]>([]);
type Box = {
    lt: Point,
    width: number,
    height: number
}

interface ControlsLine {
    lt: Point,
    rt: Point,
    rb: Point,
    lb: Point,
    offset: Point,
    rotate: number,
    index: number,
}
const tidyUpHorLines = ref<ControlsLine[]>([]);
const tidyUpVerLines = ref<ControlsLine[]>([]);
const verSpaceBox = ref<Box[]>([]);
const horSpaceBox = ref<Box[]>([]);
const cursor_point = ref<Point>({ x: 0, y: 0 });
const cursor_down = ref(false);
const tidyUpHorSpace = ref(0);
const tidyUpVerSpace = ref(0);
const selectedShapes = ref<ShapeView[][]>([]);
const need_reset_cursor_after_transform = ref(true);
const tidyUp = () => {
    const selected = props.context.selection.selectedShapes;
    const { width, height } = getSelectedWidthHeight(props.context, selected);

    const shapes = tidyUpShapesOrder(selected, height > width);
    const frame = layoutSpacing(shapes, height > width);

    const page = props.context.selection.selectedPage!;
    const editor = props.context.editor4Page(page);
    editor.tidyUpShapesLayout(shapes, frame.hor, frame.ver, height > width, 'center');
}


const hover_mousemove = (e: MouseEvent) => {
    if (props.context.workspace.transforming || !permIsEdit(props.context) || props.context.tool.isLable) {
        return isHover.value = false;
    }
    cursor_point.value = props.context.workspace.getContentXY(e);
    isHover.value = true;
}

const tidyUpDot = () => {
    const shapes = props.context.selection.selectedShapes;
    if (shapes.length <= 1) return;
    const parent = shapes[0].parent;
    if (!parent) return;
    const matrix = new Matrix();
    const matrix2 = new Matrix(props.context.workspace.matrix);
    matrix.reset(matrix2);
    const shape_root_m = parent.matrix2Root();
    const m = makeShapeTransform2By1(shape_root_m).clone();
    const clientTransform = makeShapeTransform2By1(matrix2);
    m.addTransform(clientTransform); //root到视图
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        const { x, y, width, height } = shape._p_frame;
        const { col0, col1, col2 } = m.transform([
            ColVector3D.FromXY(x + (width / 2), y + (height / 2)),
            ColVector3D.FromXY(x, y),
            ColVector3D.FromXY((x + width), (y + height)),
        ]);
        dots.value.push({ x: col0.x, y: col0.y, dot: (col2.x - col1.x) < 40 || (col2.y - col1.y) < 40, shape });
    }
}

const tidyUpLine = () => {
    const selected = props.context.selection.selectedShapes;
    if (selected.length <= 1) return;
    const dir = props.context.selection.isTidyUpDir;
    const shape_rows = checkTidyUpShapesOrder(selected, dir);
    tidyUpHorSpacing(shape_rows);
    tidyUpVerSpacing(shape_rows);
    const end_shapes = shape_rows.map(row => row[row.length - 1]);
    watchShapes(end_shapes);
}
const tidyUpVerSpacing = (shapes: ShapeView[][]) => {
    const selected = props.context.selection.selectedShapes;
    const dir = props.context.selection.isTidyUpDir;
    const { width: s_width, box } = getSelectedWidthHeight(props.context, selected);
    const parent = shapes[0][0].parent;
    if (!parent) return;
    const matrix = new Matrix();
    const matrix2 = new Matrix(props.context.workspace.matrix);
    matrix.reset(matrix2);
    const shape_root_m = parent.matrix2Root();
    const m = makeShapeTransform2By1(shape_root_m).clone();
    const clientTransform = makeShapeTransform2By1(matrix2);
    m.addTransform(clientTransform); //root到视图
    if (dir) {
        for (let i = 0; i < shapes.length; i++) {
            const shape_row = shapes[i];
            for (let j = 0; j < shape_row.length - 1; j++) {
                const shape = shape_row[j];
                const { x, y, width, height } = shape._p_frame;
                const clo_space = shape_row[j + 1]._p_frame.y - (y + height);
                tidyUpVerSpace.value = clo_space;
                const horSpace = m.transform([
                    ColVector3D.FromXY(x, y + height),
                    ColVector3D.FromXY(x + width, y + height),
                    ColVector3D.FromXY(x + width, y + height + clo_space),
                    ColVector3D.FromXY(x, y + height + clo_space)
                ]);
                const hor: Box = { lt: horSpace.col0, width: horSpace.col1.x - horSpace.col0.x, height: horSpace.col2.y - horSpace.col1.y };
                verSpaceBox.value.push(hor);
                const spaceLine = m.transform([
                    ColVector3D.FromXY(x, y),
                    ColVector3D.FromXY(x + width, y),
                    ColVector3D.FromXY(x + width / 2, y + height + (clo_space / 2)),
                ]);
                const rotate = Math.atan2(spaceLine.col1.y - spaceLine.col0.y, spaceLine.col1.x - spaceLine.col0.x) * (180 / Math.PI);
                const ling: ControlsLine = {
                    lt: { x: spaceLine.col2.x - 11, y: spaceLine.col2.y - 1 },
                    rt: { x: spaceLine.col2.x + 11, y: spaceLine.col2.y - 1 },
                    rb: { x: spaceLine.col2.x + 11, y: spaceLine.col2.y + 1 },
                    lb: { x: spaceLine.col2.x - 11, y: spaceLine.col2.y + 1 },
                    offset: spaceLine.col2, rotate, index: j
                }
                tidyUpHorLines.value.push(ling);
            }
        }
    } else {
        for (let i = 0; i < shapes.length - 1; i++) {
            const shape_row = shapes[i];
            const cur_row_h = Math.max(...shape_row.map(s => s._p_frame.y + s._p_frame.height));
            const next_min_y = Math.min(...shapes[i + 1].map(s => s._p_frame.y));
            const col_space = next_min_y - cur_row_h;
            tidyUpVerSpace.value = col_space;
            const maxh_shape = shape_row.find(s => s._p_frame.y + s._p_frame.height === cur_row_h);
            if (!maxh_shape) continue;
            const { x, y, width, height } = maxh_shape._p_frame;
            const verSpace = m.transform([
                ColVector3D.FromXY(x, y + height),
                ColVector3D.FromXY(x, y + height + col_space),
            ]);
            const ver: Box = {
                lt: { x: box.left, y: verSpace.col0.y },
                width: box.right - box.left,
                height: verSpace.col1.y - verSpace.col0.y,
            };
            verSpaceBox.value.push(ver);
            const { col0, col1, col2 } = m.transform([
                ColVector3D.FromXY(x, y),
                ColVector3D.FromXY(x + width, y),
                ColVector3D.FromXY(x, y + height + (col_space / 2)),
            ]);
            const rotate = Math.atan2(col1.y - col0.y, col1.x - col0.x) * (180 / Math.PI);
            const centerx = (box.right + box.left) / 2;
            const ling: ControlsLine = {
                lt: { x: centerx - ((s_width * 0.8) / 2), y: col2.y - 1 },
                rt: { x: centerx + ((s_width * 0.8) / 2), y: col2.y - 1 },
                rb: { x: centerx + ((s_width * 0.8) / 2), y: col2.y + 1 },
                lb: { x: centerx - ((s_width * 0.8) / 2), y: col2.y + 1 },
                offset: { x: centerx, y: col2.y }, rotate, index: i
            }
            tidyUpHorLines.value.push(ling);
        }
    }
}
const tidyUpHorSpacing = (shapes: ShapeView[][]) => {
    const selected = props.context.selection.selectedShapes;
    const dir = props.context.selection.isTidyUpDir;
    const { height: s_height, box } = getSelectedWidthHeight(props.context, selected);
    const parent = shapes[0][0].parent;
    if (!parent) return;
    const matrix = new Matrix();
    const matrix2 = new Matrix(props.context.workspace.matrix);
    matrix.reset(matrix2);
    const shape_root_m = parent.matrix2Root();
    const m = makeShapeTransform2By1(shape_root_m).clone();
    const clientTransform = makeShapeTransform2By1(matrix2);
    m.addTransform(clientTransform); //root到视图
    if (dir) {
        // 垂直调整
        for (let i = 0; i < shapes.length - 1; i++) {
            const shape_row = shapes[i];
            const cur_col_w = Math.max(...shape_row.map(s => s._p_frame.x + s._p_frame.width));
            const next_min_x = Math.min(...shapes[i + 1].map(s => s._p_frame.x));
            const row_space = next_min_x - cur_col_w;
            tidyUpHorSpace.value = row_space;
            const maxw_shape = shape_row.find(s => s._p_frame.x + s._p_frame.width === cur_col_w);
            if (!maxw_shape) continue;
            const { x, y, width, height } = maxw_shape._p_frame;
            const horSpace = m.transform([
                ColVector3D.FromXY(x + width, y),
                ColVector3D.FromXY(x + width + row_space, y),
            ]);
            const hor: Box = {
                lt: { x: horSpace.col0.x, y: box.top },
                width: horSpace.col1.x - horSpace.col0.x,
                height: box.bottom - box.top,
            };
            horSpaceBox.value.push(hor);
            const { col0, col1, col2 } = m.transform([
                ColVector3D.FromXY(x, y),
                ColVector3D.FromXY(x + width, y),
                ColVector3D.FromXY(x + width + (row_space / 2), y),
            ]);
            const rotate = Math.atan2(col1.y - col0.y, col1.x - col0.x) * (180 / Math.PI);
            const centery = (box.bottom + box.top) / 2;
            const ling: ControlsLine = {
                lt: { x: col2.x - ((s_height * 0.8) / 2), y: centery - 1 },
                rt: { x: col2.x + ((s_height * 0.8) / 2), y: centery - 1 },
                rb: { x: col2.x + ((s_height * 0.8) / 2), y: centery + 1 },
                lb: { x: col2.x - ((s_height * 0.8) / 2), y: centery + 1 },
                offset: { x: col2.x, y: centery }, rotate, index: i
            }
            tidyUpVerLines.value.push(ling);
        }
    } else {
        for (let i = 0; i < shapes.length; i++) {
            const shape_row = shapes[i];
            for (let j = 0; j < shape_row.length - 1; j++) {
                const shape = shape_row[j];
                const { x, y, width, height } = shape._p_frame;
                const row_space = shape_row[j + 1]._p_frame.x - (x + width);
                tidyUpHorSpace.value = row_space;
                const horSpace = m.transform([
                    ColVector3D.FromXY(x + width, y),
                    ColVector3D.FromXY(x + width + row_space, y),
                    ColVector3D.FromXY(x + width + row_space, y + height),
                    ColVector3D.FromXY(x + width, y + height)
                ]);
                const hor: Box = { lt: horSpace.col0, width: horSpace.col1.x - horSpace.col0.x, height: horSpace.col2.y - horSpace.col1.y };
                horSpaceBox.value.push(hor);
                const spaceLine = m.transform([
                    ColVector3D.FromXY(x, y),
                    ColVector3D.FromXY(x + width, y),
                    ColVector3D.FromXY(x + width + (row_space / 2), y + (height / 2)),
                ]);
                const rotate = Math.atan2(spaceLine.col1.y - spaceLine.col0.y, spaceLine.col1.x - spaceLine.col0.x) * (180 / Math.PI);
                const ling: ControlsLine = {
                    lt: { x: spaceLine.col2.x - 11, y: spaceLine.col2.y - 1 },
                    rt: { x: spaceLine.col2.x + 11, y: spaceLine.col2.y - 1 },
                    rb: { x: spaceLine.col2.x + 11, y: spaceLine.col2.y + 1 },
                    lb: { x: spaceLine.col2.x - 11, y: spaceLine.col2.y + 1 },
                    offset: spaceLine.col2, rotate, index: j
                }
                tidyUpVerLines.value.push(ling);
            }
        }
    }
}

const clear = () => {
    tidyUpHorLines.value = [];
    tidyUpVerLines.value = [];
    verSpaceBox.value = [];
    horSpaceBox.value = [];
    dots.value = [];
}

const update = () => {
    if (props.context.workspace.tidyUpIsTrans) {
        const d = props.context.selection.isTidyUpDir;
        updateHorAndVerBox(tidyUpHorSpace.value, tidyUpVerSpace.value, d);
        return;
    };
    clear();
    if (isTidyUp.value || props.context.workspace.isScaling || props.context.workspace.isRotating || props.context.workspace.isTranslating) return;
    tidyUpDot();
    tidyUpLine();
}

const tidyUpControl = () => {
    isTidyUp.value = props.context.selection.isTidyUp;
    _update();
}
let lockMouseHandler: LockMouse | undefined = undefined;
let downClientXY: XY = { x: 0, y: 0 };
const isDragging = ref(false);
let downDir = '';
let moveIndex = 1;
let horSpacing = 0;
let verSpacing = 0;
let minHor = 0;
let minVer = 0;
let shapes_rows: ShapeView[][] = [];
const mousedown = (e: MouseEvent, dir: 'ver' | 'hor', index: number) => {
    e.stopPropagation();
    cursor_down.value = true;
    downClientXY.x = e.clientX;
    downClientXY.y = e.clientY;
    downDir = dir;
    moveIndex = index;
    const selected = props.context.selection.selectedShapes;
    const d = props.context.selection.isTidyUpDir;
    shapes_rows = checkTidyUpShapesOrder(selected, d);
    selectedShapes.value = [...shapes_rows];
    minVer = Math.min(...selected.map(s => s._p_frame.height - 1));
    minHor = Math.min(...selected.map(s => s._p_frame.width - 1));
    props.context.workspace.setTidyUpIsTrans(true);
    lockMouseHandler = new LockMouse(props.context, e);
    document.addEventListener('mousemove', mousemove);
    document.addEventListener('mouseup', mouseup);
}

const mousemove = (e: MouseEvent) => {
    e.stopPropagation();
    cursor_point.value = props.context.workspace.getContentXY(e);
    if (isDragging.value) {
        if (!lockMouseHandler) {
            return
        }
        if (!lockMouseHandler.asyncApiCaller) {
            lockMouseHandler.createApiCaller();
        }

        const selected = props.context.selection.selectedShapes;
        const parent = selected[0].parent!
        const matrix2Root = parent.matrix2Root();
        const m = new Matrix(matrix2Root.inverse);
        const downXy = m.computeCoord(downClientXY);
        const moveXy = m.computeCoord2(e.clientX, e.clientY);
        const scale = props.context.workspace.matrix.m00;
        const dir = props.context.selection.isTidyUpDir;
        let hor = horSpacing;
        let ver = verSpacing;
        const value1 = ((moveXy.x - downXy.x) / scale) * 2;
        const value2 = ((moveXy.y - downXy.y) / scale) * 2;
        if (downDir === 'hor') {
            hor = Math.max(Math.floor((value1 / moveIndex)) + horSpacing, -minHor);
        } else {
            ver = Math.max(Math.floor((value2 / moveIndex)) + verSpacing, -minVer);
        }
        tidyUpHorSpace.value = hor;
        tidyUpVerSpace.value = ver;
        props.context.attr.notify(Attribute.TIDY_UP_SPACE_CHANGE, { hor, ver })
        selectedShapes.value = [...shapes_rows];
        const algin = props.context.selection.tidyUpAlgin;
        lockMouseHandler.executeTidyup([...shapes_rows], hor, ver, dir, algin);
    } else {
        const diff = Math.hypot(e.clientX - downClientXY.x, e.clientY - downClientXY.y);
        if (diff > 4) {
            isDragging.value = true;
            horSpacing = tidyUpHorSpace.value;
            verSpacing = tidyUpVerSpace.value;
        }
    }
}

const verSpaceFill = ref(false);
const mouseup = (e: MouseEvent) => {
    e.stopPropagation();
    clear_status();
}
function clear_status() {
    isDragging.value = false;
    cursor_down.value = false;
    selectedShapes.value = [];
    props.context.workspace.setTidyUpIsTrans(false);
    lockMouseHandler?.fulfil();
    lockMouseHandler = undefined;
    downDir = '';
    if (!need_reset_cursor_after_transform.value) {
        props.context.cursor.reset();
    }
    document.removeEventListener('mousemove', mousemove);
    document.removeEventListener('mouseup', mouseup);
}


const updateHorAndVerBox = (hor: number, ver: number, dir: boolean) => {
    const shapes = selectedShapes.value.length ? selectedShapes.value : shapes_rows;
    if (!shapes.length) return;
    const selected = props.context.selection.selectedShapes;
    const { box } = getSelectedWidthHeight(props.context, selected);
    const parent = shapes[0][0].parent;
    if (!parent) return;
    const matrix = new Matrix();
    const matrix2 = new Matrix(props.context.workspace.matrix);
    matrix.reset(matrix2);
    const shape_root_m = parent.matrix2Root();
    const m = makeShapeTransform2By1(shape_root_m).clone();
    const clientTransform = makeShapeTransform2By1(matrix2);
    m.addTransform(clientTransform); //root到视图
    if (dir) {
        if (downDir === 'hor') {
            for (let i = 0; i < shapes.length - 1; i++) {
                const shape_row = shapes[i];
                const cur_col_w = Math.max(...shape_row.map(s => s._p_frame.x + s._p_frame.width));
                const maxw_shape = shape_row.find(s => s._p_frame.x + s._p_frame.width === cur_col_w);
                if (!maxw_shape) continue;
                const { x, y, width } = maxw_shape._p_frame;
                const horSpace = m.transform([
                    ColVector3D.FromXY(x + width, y),
                    ColVector3D.FromXY(x + width + hor, y),
                ]);
                const horBox: Box = {
                    lt: { x: horSpace.col0.x, y: box.top },
                    width: horSpace.col1.x - horSpace.col0.x,
                    height: box.bottom - box.top,
                };
                horSpaceBox.value[i] = horBox;
            }
        } else {
            let index = 0;
            for (let i = 0; i < shapes.length; i++) {
                const shape_row = shapes[i];
                for (let j = 0; j < shape_row.length - 1; j++) {
                    const shape = shape_row[j];
                    const { x, y, width, height } = shape._p_frame;
                    const horSpace = m.transform([
                        ColVector3D.FromXY(x, y + height),
                        ColVector3D.FromXY(x + width, y + height),
                        ColVector3D.FromXY(x + width, y + height + ver),
                        ColVector3D.FromXY(x, y + height + ver)
                    ]);
                    const verBox: Box = { lt: horSpace.col0, width: horSpace.col1.x - horSpace.col0.x, height: horSpace.col2.y - horSpace.col1.y };
                    verSpaceBox.value[index] = verBox;
                    index++;
                }
            }
        }
    } else {
        if (downDir === 'hor') {
            let index = 0;
            for (let i = 0; i < shapes.length; i++) {
                const shape_row = shapes[i];
                for (let j = 0; j < shape_row.length - 1; j++) {
                    const shape = shape_row[j];
                    const { x, y, width, height } = shape._p_frame;
                    const horSpace = m.transform([
                        ColVector3D.FromXY(x + width, y),
                        ColVector3D.FromXY(x + width + hor, y),
                        ColVector3D.FromXY(x + width + hor, y + height),
                        ColVector3D.FromXY(x + width, y + height)
                    ]);
                    const horBox: Box = { lt: horSpace.col0, width: horSpace.col1.x - horSpace.col0.x, height: horSpace.col2.y - horSpace.col1.y };
                    horSpaceBox.value[index] = horBox;
                    index++;
                }
            }
        } else {
            for (let i = 0; i < shapes.length - 1; i++) {
                const shape_row = shapes[i];
                const cur_row_h = Math.max(...shape_row.map(s => s._p_frame.y + s._p_frame.height));
                const maxh_shape = shape_row.find(s => s._p_frame.y + s._p_frame.height === cur_row_h);
                if (!maxh_shape) continue;
                const { x, y, height } = maxh_shape._p_frame;
                const verSpace = m.transform([
                    ColVector3D.FromXY(x, y + height),
                    ColVector3D.FromXY(x, y + height + ver),
                ]);
                const verbox: Box = {
                    lt: { x: box.left, y: verSpace.col0.y },
                    width: box.right - box.left,
                    height: verSpace.col1.y - verSpace.col0.y,
                };
                verSpaceBox.value[i] = verbox;
            }
        }
    }

}

const mouseenter = (e: MouseEvent, dir: 'ver' | 'hor') => {
    cursor_point.value = props.context.workspace.getContentXY(e);
    need_reset_cursor_after_transform.value = false;
    if (dir === 'ver') verSpaceFill.value = true;
    setCursor(dir);
}

function mouseleave() {
    need_reset_cursor_after_transform.value = true;
    verSpaceFill.value = false;
    props.context.cursor.reset();
}
let transporter: TranslateHandler | undefined = undefined;
let isDrag = false;
let saveShape: ShapeView;
let isShift = false;
const selectedDown = (e: MouseEvent, shape: ShapeView) => {
    e.stopPropagation();
    isShift = e.shiftKey;
    saveShape = shape;
    document.addEventListener('mousemove', selectedMove);
    document.addEventListener('mouseup', selectedUp);
}

const selectedMove = (e: MouseEvent) => {
    e.stopPropagation();
    cursor_point.value = props.context.workspace.getContentXY(e);
    if (isDrag) {
        if (!transporter) {
            return
        }
        if (!transporter.asyncApiCaller) {
            transporter.createApiCaller('tidyUp');
        }
        transporter.execute(e);
    } else {
        const diff = Math.hypot(e.clientX - downClientXY.x, e.clientY - downClientXY.y);
        if (diff > 4) {
            isDrag = true;
            props.context.selection.selectTidyUpShape([saveShape]);
            // if (selectedShapes.value.length === 0) {
            //     props.context.selection.selectTidyUpShape([saveShape]);
            // } else {
            //     const is_multiple = selectedShapes.value.find(s => s.id === saveShape.id);
            //     if (is_multiple) {
            //         props.context.selection.selectTidyUpShape(selectedShapes.value as ShapeView[]);
            //     } else {
            //         props.context.selection.selectTidyUpShape([saveShape]);
            //     }
            // }
            const shapes = props.context.selection.selectedTidyUpShapes;
            const selected = props.context.selection.selectedShapes;
            transporter = new TranslateHandler(props.context, e, selected, [...shapes]);
        }
    }
}

const selectedUp = (e: MouseEvent) => {
    isDrag = false;
    // if (isShift && e.shiftKey) {
    //     selectedShapes.value.push(saveShape);
    // } else {
    //     selectedShapes.value = [saveShape];
    // }
    transporter?.fulfil();
    transporter = undefined;
    props.context.selection.selectTidyUpShape();
    document.removeEventListener('mousemove', selectedMove);
    document.removeEventListener('mouseup', selectedUp);
}

const selectedWatcher = (t: string | number) => {
    if (t === Selection.NEED_TIDY_UP) {
        tidyUpControl();
    } else if (t === Selection.LAYOUT_DOTTED_LINE) {
        update();
    }
}

const workspaceWatcher = (t: number | string) => {
    if (t === WorkSpace.MATRIX_TRANSFORMATION) {
        _update();
    } else if (t === WorkSpace.TRANSLATING) {
        _update();
    }
}

const watchedShapes = new Map();

function watchShapes(shapes: ShapeView[]) { // 监听相关shape的变化
    const needWatchShapes = new Map();
    if (shapes.length) {
        shapes.forEach(v => {
            needWatchShapes.set(v.id, v);
        })
    }
    watchedShapes.forEach((v, k) => {
        if (needWatchShapes.has(k)) return;
        v.unwatch(_update);
        watchedShapes.delete(k);
    })
    needWatchShapes.forEach((v, k) => {
        if (watchedShapes.has(k)) return;
        v.watch(_update);
        watchedShapes.set(k, v);
    })
}
const _update = throttle(update, 4);

function setCursor(dir: 'ver' | 'hor') {
    const cursor = props.context.cursor;
    let deg = 0;
    if (dir === 'hor' && tidyUpVerLines.value.length > 0) {
        deg = tidyUpVerLines.value[0].rotate;
    } else if (dir === 'ver' && tidyUpHorLines.value.length > 0) {
        deg = tidyUpHorLines.value[0].rotate + 90;
    }
    cursor.setType(CursorType.Scale, deg);
}
function window_blur() {
    clear_status();
}

onMounted(() => {
    tidyUpControl();
    window.addEventListener('blur', window_blur);
    props.context.selection.watch(selectedWatcher);
    props.context.workspace.watch(workspaceWatcher);
})
onUnmounted(() => {
    window.removeEventListener('blur', window_blur);
    props.context.selection.watch(selectedWatcher);
    props.context.workspace.unwatch(workspaceWatcher);
    watchedShapes.forEach((v, k) => {
        v.unwatch(_update);
        watchedShapes.delete(k);
    })
})
</script>

<template>
    <g @mousemove="hover_mousemove" @mouseleave="isHover = false">
        <path
            :d="`M ${controllerFrame[0].x} ${controllerFrame[0].y} L ${controllerFrame[1].x} ${controllerFrame[1].y} L ${controllerFrame[2].x} ${controllerFrame[2].y} L ${controllerFrame[3].x} ${controllerFrame[3].y} Z`"
            fill="transparent" />
        <g v-if="!isTidyUp && !isHover && !cursor_down">
            <circle v-for="(dot, index) in dots" :key="index" :cx="dot.x" :cy="dot.y" r="2.5" fill="#D13BCD"
                stroke="#FFFFFF" stroke-width="1" />
        </g>
        <g v-if="!isTidyUp && downDir">
            <rect v-for="(box, index) in verSpaceBox" :key="index" class="padding-rect" ref="horSpcae" :x="box.lt.x"
                :y="box.height >= 0 ? box.lt.y : box.lt.y + box.height" :width="box.width"
                :height="Math.abs(box.height)" :class="{ spaceFill: downDir === 'ver' }" />
            <rect v-for="(box, index) in horSpaceBox" :key="index" class="padding-rect" ref="horSpcae"
                :x="box.width >= 0 ? box.lt.x : box.lt.x + box.width" :y="box.lt.y" :width="Math.abs(box.width)"
                :height="box.height" :class="{ spaceFill: downDir === 'hor' }" />
        </g>
        <g v-if="!isTidyUp && isHover && !isDragging && !isDrag">
            <g v-for="(dot, index) in dots" :key="index">
                <circle v-if="dot.dot" :cx="dot.x" :cy="dot.y" r="2.5" fill="#D13BCD" stroke="#FFFFFF"
                    stroke-width="1" />
                <g v-else @mousedown="(e) => selectedDown(e, dot.shape as ShapeView)">
                    <circle :cx="dot.x" :cy="dot.y" r="6" fill="transparent" stroke="#FFFFFF" stroke-width="1" />
                    <circle :cx="dot.x" :cy="dot.y" r="4" fill="transparent" stroke="#FFFFFF" stroke-width="1" />
                    <circle class="hovered" :cx="dot.x" :cy="dot.y" r="5" fill="transparent" stroke="#D13BCD"
                        stroke-width="1" />
                </g>
            </g>
            <!-- 水平间距控件 -->
            <g v-for="(line, index) in tidyUpVerLines" :key="index">
                <path class="line"
                    :style="{ transform: `translate(${line.offset.x}px, ${line.offset.y}px) rotate(${line.rotate - 90}deg) translate(${-line.offset.x}px, ${-line.offset.y}px)` }"
                    :d="`M ${line.lt.x} ${line.lt.y} L ${line.rt.x} ${line.rt.y} L 
                    ${line.rb.x} ${line.rb.y} L ${line.lb.x} ${line.lb.y}`" />
                <path @mousedown.stop="(e) => mousedown(e, 'hor', line.index * 2 + 1)"
                    @mouseenter="(e) => mouseenter(e, 'hor')" @mouseleave="mouseleave"
                    :style="{ stroke: 'transparent', fill: 'transparent', 'stroke-width': '4px', transform: `translate(${line.offset.x}px, ${line.offset.y}px) rotate(${line.rotate - 90}deg) translate(${-line.offset.x}px, ${-line.offset.y}px)` }"
                    :d="`M ${line.lt.x} ${line.lt.y} L ${line.rt.x} ${line.rt.y} L 
                    ${line.rb.x} ${line.rb.y} L ${line.lb.x} ${line.lb.y}`" />
            </g>
            <!-- 垂直间距控件 -->
            <g v-for="(line, index) in tidyUpHorLines" :key="index">
                <path class="line"
                    :style="{ transform: `translate(${line.offset.x}px, ${line.offset.y}px) rotate(${line.rotate}deg) translate(${-line.offset.x}px, ${-line.offset.y}px)` }"
                    :d="`M ${line.lt.x} ${line.lt.y} L ${line.rt.x} ${line.rt.y} L 
                    ${line.rb.x} ${line.rb.y} L ${line.lb.x} ${line.lb.y}`" />
                <path @mousedown.stop="(e) => mousedown(e, 'ver', line.index * 2 + 1)"
                    @mouseenter="(e) => mouseenter(e, 'ver')" @mouseleave="mouseleave"
                    :style="{ stroke: 'transparent', fill: 'transparent', 'stroke-width': '4px', transform: `translate(${line.offset.x}px, ${line.offset.y}px) rotate(${line.rotate}deg) translate(${-line.offset.x}px, ${-line.offset.y}px)` }"
                    :d="`M ${line.lt.x} ${line.lt.y} L ${line.rt.x} ${line.rt.y} L 
                    ${line.rb.x} ${line.rb.y} L ${line.lb.x} ${line.lb.y}`" />
            </g>
        </g>
        <foreignObject v-if="isHover && isTidyUp" :x="controllerFrame[2].x - 32" :y="controllerFrame[2].y - 32"
            width="32px" height="32px">
            <div class="button">
                <svg-icon icon-class="white-tidy-up"></svg-icon>
            </div>
        </foreignObject>

        <foreignObject v-if="!isTidyUp && (cursor_down || !need_reset_cursor_after_transform)" :x="cursor_point.x + 10"
            :y="cursor_point.y + 10" width="100px" height="28px">
            <div class="percent_container">
                <span>{{ fixedZero(downDir === 'ver' || verSpaceFill ? tidyUpVerSpace : tidyUpHorSpace) }} </span>
            </div>
        </foreignObject>
        <rect v-if="isHover && isTidyUp" :x="controllerFrame[2].x - 32" :y="controllerFrame[2].y - 32" width="24"
            height="24" fill="transparent" @mousemove="hover_mousemove" @mousedown.stop @mouseup.stop="tidyUp"></rect>
    </g>
</template>

<style scoped lang="scss">
.button {
    position: absolute;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    background-color: #1878F5;
    display: flex;
    align-items: center;
    justify-content: center;

    >svg {
        width: 14px;
        height: 14px;
    }
}

.line {
    fill: #D13BCD;
    stroke-width: 1px;
    stroke: #FFFFFF;
    opacity: 1;
}

.hovered {
    &:hover {
        fill: #D13BCD;
    }
}

.padding-rect {
    fill: none;
}

.spaceFill {
    fill: #F7BCEF;
}

.percent_container {
    position: absolute;
    display: flex;
    max-width: 100px;
    font-size: 12px;
    color: #ffffff;
    box-sizing: border-box;

    span {
        padding: 4px;
        border-radius: 4px;
        background-color: #D13BCD;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}
</style>