<script setup lang="ts">
import { GroupShape, Matrix, Shape, Page, ShapeFrame, AsyncCreator, ShapeType } from '@kcdesign/data';
import { Context } from '@/context';
import { reactive, onMounted, onUnmounted, computed, ref, nextTick, watch } from 'vue';
import PageView from './Content/PageView.vue';
import SelectionView from './Selection/SelectionView.vue';
import { PageXY, ClientXY, ClientXYRaw } from '@/context/selection';
import { init as renderinit } from '@/render';
import { Action, KeyboardKeys, ResultByAction, WorkSpace } from '@/context/workspace';
import ContextMenu from '../common/ContextMenu.vue';
import PageViewContextMenuItems from '@/components/Document/Menu/PageViewContextMenuItems.vue';
import Selector, { SelectorFrame } from './Selection/Selector.vue';
import { useI18n } from 'vue-i18n';
import { styleSheetController, StyleSheetController } from "@/utils/cursor";
import { v4 as uuid } from "uuid";
import { fourWayWheel, Wheel, EffectType } from '@/utils/wheel';
import { updateRoot, getName } from '@/utils/content';
import { insertFrameTemplate } from '@/utils/artboardFn';
import CommentInput from './Content/CommentInput.vue';
import PageCommentItem from './Content/PageCommentItem.vue'
import * as comment_api from '@/apis/comment';
import { useRoute } from 'vue-router';
type ContextMenuEl = InstanceType<typeof ContextMenu>;
const { t } = useI18n();
const props = defineProps<{
    context: Context,
    page: Page,
}>();
const STATE_NONE = 0;
const STATE_CHECKMOVE = 1;
const STATE_MOVEING = 2;
const workspace = computed(() => props.context.workspace);
let scale_delta = 1.06;
let scale_delta_ = 1 / scale_delta;
const wheel_step = 50;
const spacePressed = ref<boolean>(false);
const contextMenu = ref<boolean>(false);
const contextMenuPosition: ClientXY = reactive({ x: 0, y: 0 });
let state = STATE_NONE;
const dragActiveDis = 4; // 拖动 3px 后开始触发移动
const prePt: { x: number, y: number } = { x: 0, y: 0 };
const matrix = reactive(props.context.workspace.matrix); // 一切图形可视变换的根源！！！
const matrixMap = new Map<string, { m: Matrix, x: number, y: number }>();
const reflush = ref(0);
const watcher = () => { reflush.value++ };
const inited = ref(false);
const root = ref<HTMLDivElement>();
const mousedownOnClientXY: ClientXY = { x: 0, y: 0 }; // 鼠标在可视区中的坐标
const mousedownOnPageXY: PageXY = { x: 0, y: 0 }; // 鼠标在page中的坐标
const mouseOnClient: ClientXYRaw = { x: 0, y: 0 }; // 没有减去根部节点
let shapesContainsMousedownOnPageXY: Shape[] = [];
let contextMenuItems: string[] = [];
let newShape: Shape | undefined;
const contextMenuEl = ref<ContextMenuEl>();
const surplusY = ref<number>(0);
const site: { x: number, y: number } = { x: 0, y: 0 };
const selector = ref<boolean>(false);
const selectorFrame = ref<SelectorFrame>({ top: 0, left: 0, width: 0, height: 0 });
const cursorClass = ref<string>('');
const styler = ref<StyleSheetController>(styleSheetController());
const rootId = ref<string>('content');
let wheel: Wheel | undefined;
let asyncCreator: AsyncCreator | undefined;
let isMouseLeftPress: boolean = false; // 针对在contentview里面
const commentInput = ref(false)

function rootRegister(mount: boolean) {
    if (mount) {
        const id = (uuid().split('-').at(-1)) || 'content';
        rootId.value = id;
    } else {
        rootId.value = 'content';
    }
    workspace.value.setRootId(rootId.value);
}
function setMousedownXY(e: MouseEvent) { // 记录鼠标在页面上的点击位置
    const { clientX, clientY } = e;
    const { x, y } = workspace.value.root;
    const xy = matrix.inverseCoord(clientX - x, clientY - y);
    mousedownOnPageXY.x = xy.x, mousedownOnPageXY.y = xy.y; //页面坐标系上的点
    mousedownOnClientXY.x = clientX - x, mousedownOnClientXY.y = clientY - y; // 用户端可视区上的点
}
function getMouseOnPageXY(e: MouseEvent): PageXY { // 获取鼠标在页面上的点击位置
    const { clientX, clientY } = e;
    const { x, y } = workspace.value.root;
    return matrix.inverseCoord(clientX - x, clientY - y);
}
function initShape(frame: ShapeFrame) { // 根据当前编辑器的action新增图形
    const selection = props.context.selection;
    const type = ResultByAction(workspace.value.action);
    const page = selection.selectedPage;
    const parent = selection.getClosetArtboard(mousedownOnPageXY);
    if (page && parent && type) {
        const editor = props.context.editor.controller();
        const name = getName(type, parent.childs, t);
        asyncCreator = editor.asyncCreator(mousedownOnPageXY);
        const shape = asyncCreator.init(page, (parent as GroupShape), type, name, frame);
        selection.selectShape(shape);
        return shape;
    }
}
function onMouseWheel(e: WheelEvent) { // 滚轮、触摸板事件
    e.preventDefault();
    const xy = workspace.value.root;
    const { ctrlKey, metaKey, shiftKey, deltaX, deltaY } = e;
    const offsetX = e.x - xy.x;
    const offsetY = e.y - xy.y;
    if (ctrlKey || metaKey) { // 缩放
        if (Number((props.context.workspace.matrix.toArray()[0] * 100).toFixed(0)) <= 2) {
            scale_delta_ = 1
        } else {
            scale_delta_ = 1 / scale_delta;
        }
        matrix.trans(-offsetX, -offsetY);
        matrix.scale(Math.sign(deltaY) <= 0 ? scale_delta : scale_delta_);
        matrix.trans(offsetX, offsetY);
    } else {
        if (Math.abs(deltaX) + Math.abs(deltaY) < 150) { // 临时适配方案，需根据使用设备进一步完善适配
            matrix.trans(-deltaX, -deltaY);
        } else {
            const delta = deltaY > 0 ? -wheel_step : wheel_step;
            if (shiftKey) {
                matrix.trans(delta, 0);
            } else {
                matrix.trans(0, delta);
            }
        }
    }
    search(e) // 滚动过程进行常规图形检索
    workspace.value.matrixTransformation();
}
function onKeyDown(e: KeyboardEvent) { // 键盘监听
    if (e.code === KeyboardKeys.Space) {
        preToDragPage();
    } else if (e.code === 'MetaLeft' || e.code === 'ControlLeft') {
        _search(true); // 根据鼠标当前位置进行一次穿透式图形检索
    }
}
function onKeyUp(e: KeyboardEvent) {
    if (spacePressed.value && e.code === KeyboardKeys.Space) {
        endDragPage();
    } else if (e.code === 'MetaLeft' || e.code === 'ControlLeft') {
        _search(false);// 根据鼠标当前位置进行一次冒泡式图形检索
    }
}
function preToDragPage() { // 编辑器准备拖动页面
    spacePressed.value = true;
    workspace.value.setCtrl('page');
    workspace.value.pageDragging(true);
    props.context.selection.unHoverShape();
    setClass('grab-0');
}
function endDragPage() { // 编辑器完成拖动页面
    const action: Action = props.context.workspace.action;
    if (action.startsWith('add')) {
        setClass('cross-0');
    } else {
        setClass('auto-0');
    }
    spacePressed.value = false;
    workspace.value.pageDragging(false);
}
function pageEditorOnMoveEnd(e: MouseEvent) {
    const { x, y } = getMouseOnPageXY(e);
    const deltaX = Math.abs(x - mousedownOnPageXY.x);
    const deltaY = Math.abs(y - mousedownOnPageXY.y);
    const shapeFrame = new ShapeFrame(x, y, deltaX, deltaY);
    const diff = Math.hypot(deltaX, deltaY);
    if (diff > dragActiveDis) {// 抬起之前存在拖动
        if (newShape) {
            shapeCreateEnd();
        } else {
            selectEnd();
        }
    } else {
        // 抬起之前未存在拖动
        shapeFrame.height = 100;
        shapeFrame.width = 100;
        const action = workspace.value.action;
        if (action.startsWith('add')) { // 存在action
            initShape(shapeFrame); // 添加shape
            removeCreator();
        }
    }
    setClass('auto-0');
}
function contentEditOnMoving(e: MouseEvent) { // 编辑page内容
    const { x, y } = getMouseOnPageXY(e);
    if (newShape) {
        if (wheel && asyncCreator) {
            const isOut = wheel.moving(e, { type: EffectType.NEW_SHAPE, effect: asyncCreator.setFrameByWheel });
            if (!isOut) {
                asyncCreator.setFrame({ x, y });
            }
        }
    } else {
        const deltaX = x - mousedownOnPageXY.x;
        const deltaY = y - mousedownOnPageXY.y;
        const diff = Math.hypot(deltaX, deltaY);
        if (diff > dragActiveDis) {
            const shapeFrame = new ShapeFrame(x, y, 3, 3);
            newShape = initShape(shapeFrame);
            props.context.selection.selectShape(newShape);
            workspace.value.creating(true);
        }
    }
}
function workspaceUpdate(t?: number, name?: string) { // 更新编辑器状态，包括光标状态、是否正在进行图形变换
    if (t === WorkSpace.CURSOR_CHANGE) {
        if (name !== undefined) {
            setClass(name);
        }
    } else {
        if (t === WorkSpace.MATRIX_TRANSFORMATION) {
            matrix.reset(workspace.value.matrix);
        } else if (t === WorkSpace.RESET_CURSOR) {
            setClass('auto-0');
        } else if (t === WorkSpace.INSERT_FRAME) {
            insertFrame(); // 插入容器
        }
        const action = props.context.workspace.action;
        if (action.startsWith('add')) {
            setClass('cross-0');
        } else {
            setClass('auto-0');
        }
    }
    //更新评论
    if(t === WorkSpace.EDIT_COMMENT) {
        const timer = setTimeout(() => {
            getDocumentComment(docID)
            clearTimeout(timer)
        }, 500);
    }
}

async function setClass(name: string) {
    const _n = await styler.value.getClass(name);
    cursorClass.value = _n;
}
function insertFrame() {
    const brothers = props.context.selection.selectedPage?.childs || [];
    const name = getName(ShapeType.Artboard, brothers, t);
    insertFrameTemplate(props.context, name);
}
function selectShapes(shapes: Shape[]) {
    const hoveredShape = shapes[0], selection = props.context.selection;
    if (hoveredShape) {
        const selected = selection.selectedShapes;
        if (selected.length) {
            const isSelected = selected.find((s: Shape) => s.id == hoveredShape.id);
            if (!isSelected) {
                selection.hoverShape(hoveredShape);
            } else {
                selection.unHoverShape();
            }
        } else {
            selection.hoverShape(hoveredShape);
        }
    } else {
        selection.unHoverShape();
    }
}
function _search(auto: boolean) { // 支持阻止子元素冒泡的图形检索
    const { x, y } = workspace.value.root;
    const { x: mx, y: my } = mouseOnClient;
    const xy: PageXY = matrix.inverseCoord(mx - x, my - y);
    const shapes = props.context.selection.getShapesByXY_beta(xy, false, auto);
    selectShapes(shapes);
}
function search(e: MouseEvent) { // 常规图形检索
    if (props.context.workspace.transforming) return; // 编辑器编辑过程中不再判断其他未选择的shape的hover状态
    const { clientX, clientY, metaKey, ctrlKey } = e;
    const { x, y } = workspace.value.root;
    const xy = matrix.inverseCoord(clientX - x, clientY - y);
    const shapes = props.context.selection.getShapesByXY_beta(xy, false, metaKey || ctrlKey); // xy: PageXY
    selectShapes(shapes);
}
function pageViewDragStart(e: MouseEvent) {
    state = STATE_CHECKMOVE;
    prePt.x = e.screenX;
    prePt.y = e.screenY;
}
function pageViewDragging(e: MouseEvent) {
    const isController = workspace.value.controller == 'page';
    if (isController) {
        const dx = e.screenX - prePt.x;
        const dy = e.screenY - prePt.y;
        if (state === STATE_MOVEING) {
            matrix.trans(dx, dy);
            prePt.x = e.screenX;
            prePt.y = e.screenY;
        } else {
            const diff = Math.hypot(dx, dy);
            if (diff > dragActiveDis) {
                state = STATE_MOVEING;
                matrix.trans(dx, dy);
                prePt.x = e.screenX;
                prePt.y = e.screenY;
            }
        }
    }
}
function pageViewDragEnd() {
    setClass('grab-0');
    state = STATE_NONE;
}
function contextMenuMount(e: MouseEvent) {
    const workspace = props.context.workspace;
    const selection = props.context.selection;
    workspace.menuMount(false);
    site.x = e.clientX
    site.y = e.clientY
    const { x, y } = workspace.root;
    contextMenuPosition.x = e.clientX - x;
    contextMenuPosition.y = e.clientY - y;
    setMousedownXY(e); // 更新鼠标定位
    const shapes = selection.getShapesByXY(mousedownOnPageXY);
    contextMenuItems = ['paste', 'copy'];
    if (!shapes.length) {
        contextMenuItems = ['all', 'copy', 'paste', 'half', 'hundred', 'double', 'canvas', 'cursor', 'comment', 'ruler', 'pixel', 'operation'];
        selection.resetSelectShapes();
    } else if (shapes.length === 1) {
        contextMenuItems = ['paste', 'copy', 'visible', 'lock', 'forward', 'back', 'top', 'bottom', 'groups', 'container', 'un_group', 'component', 'instance', 'reset', 'edit'];
        selection.selectShape(shapes[shapes.length - 1]);
    } else if (shapes.length > 1) {
        const isCommon = hasCommon(selection.selectedShapes, shapes);
        if (!isCommon) {
            selection.selectShape(shapes[shapes.length - 1]);
        }
        shapesContainsMousedownOnPageXY.length = 0;
        shapesContainsMousedownOnPageXY = shapes;
        contextMenuItems = ['paste', 'copy', 'visible', 'lock', 'forward', 'back', 'top', 'bottom', 'layers', 'groups', 'container', 'un_group', 'component', 'instance', 'reset', 'edit'];
    }
    contextMenu.value = true;
    document.addEventListener('keydown', esc);
    nextTick(() => {
        if (contextMenuEl.value) {
            const el = contextMenuEl.value.menu;
            surplusY.value = document.documentElement.clientHeight - site.y;
            if (el) {
                const height = el.offsetHeight;
                if (surplusY.value - 30 < height) {
                    surplusY.value = document.documentElement.clientHeight - site.y - 30;
                    el.style.top = contextMenuPosition.y + surplusY.value - height + 'px';
                }
            }
        }
    })

    function hasCommon(arr1: any[], arr2: any[]) {
        const arr = [];
        for (let i = 0; i < arr1.length; i++) {
            arr[i] = arr1[i].__uuid;
        }
        for (let i = 0; i < arr2.length; i++) {
            if (arr.includes(arr2[i].__uuid)) return true;
        }
        return false;
    }
}
function esc(e: KeyboardEvent) {
    if (e.code === 'Escape') contextMenuUnmount();
}
async function stylerForCursorMount() {
    await styler.value.setup();
    cursorClass.value = await styler.value.getClass('auto-0');
}
function contextMenuUnmount() {
    document.removeEventListener('keydown', esc);
    contextMenu.value = false;
}
function select(e: MouseEvent) {
    if (props.context.workspace.select) {
        createSelector(e);
    } else {
        const { clientX, clientY } = e;
        const root = workspace.value.root;
        const { x: cx, y: cy } = { x: clientX - root.x, y: clientY - root.y };
        const { x: sx, y: sy } = mousedownOnClientXY;
        const dx = cx - sx;
        const dy = cy - sy;
        const diff = Math.hypot(dx, dy);
        if (diff > 3 * dragActiveDis) {
            props.context.workspace.selecting(true);
        }
    }
}
function createSelector(e: MouseEvent) { // 创建一个selector框选器
    const { clientX, clientY } = e;
    const { x: rx, y: ry } = workspace.value.root;
    const { x: mx, y: my } = { x: clientX - rx, y: clientY - ry };
    const { x: sx, y: sy } = mousedownOnClientXY;
    const left = Math.min(sx, mx);
    const right = Math.max(mx, sx);
    const top = Math.min(my, sy);
    const bottom = Math.max(my, sy);
    selectorFrame.value.top = top;
    selectorFrame.value.left = left;
    selectorFrame.value.width = right - left;
    selectorFrame.value.height = bottom - top;
    selector.value = true;
}
function wheelSetup() { // 安装滚轮
    wheel = fourWayWheel(props.context, { rolling: undefined }, mousedownOnPageXY);
}
function updateMouse(e: MouseEvent) {
    const { clientX, clientY } = e;
    mouseOnClient.x = clientX;
    mouseOnClient.y = clientY;
}
// #region mouse event flow
// mousedown(target：contentview)
function onMouseDown(e: MouseEvent) {    
    if (workspace.value.transforming) return; // 当图形变换过程中不再接收新的鼠标点击事件
    if (e.button == 0) { // 左键按下
        setMousedownXY(e); // 记录鼠标点下的位置（相对于page）
        if (spacePressed.value) {
            pageViewDragStart(e); // 空格键press，准备拖动页面
        } else {
            wheelSetup();
            isMouseLeftPress = true;
            if(workspace.value.action !== Action.AddComment) {
                if(commentInput.value) {
                    commentInput.value = false;
                }
            }
        }
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    } else if (e.button == 2) { // 右键按下，右键菜单处理
        e.stopPropagation();
        contextMenuMount(e);
    }
}
// mousemove(target：document)
function onMouseMove(e: MouseEvent) {
    if (workspace.value.controller == 'page') {
        if (e.buttons == 1) { // button 事件绑定键，buttons事件发生时被按下的键
            if (spacePressed.value) {
                pageViewDragging(e); // 拖拽页面
            } else {
                if (workspace.value.action != Action.AutoV && workspace.value.action != Action.AddComment) {
                    contentEditOnMoving(e); // 新增图形、切片     
                }
            }
        }
    }
}
// mousemove(target：contentview) 
function onMouseMove_CV(e: MouseEvent) {
    if (workspace.value.controller == 'page') {
        if (!spacePressed.value) {
            if (e.buttons == 1) {
                if (workspace.value.action == Action.AutoV && isMouseLeftPress) {
                    select(e); // 选区
                }
            } else if (e.buttons == 0) {
                if (workspace.value.action == Action.AutoV) {
                    search(e); // 图形检索(hover)
                }
            }
        }
    }
    updateMouse(e);
}
// mouseup(target：document)
function onMouseUp(e: MouseEvent) {
    if (e.button == 0) {
        if (spacePressed.value) {
            pageViewDragEnd();
        } else {
            if(workspace.value.action === Action.AddComment) {
                addComment(e)
            }else {
                if(commentInput.value) {
                    commentInput.value = false;
                }
                pageEditorOnMoveEnd(e);
            }
            selectEnd();
            removeWheel();
            isMouseLeftPress = false;
        }
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }
}
// mouseleave
function onMouseLeave() {
    props.context.selection.unHoverShape();
}
// #endregion
function selectEnd() {
    if (props.context.workspace.select) {
        props.context.workspace.selecting(false);
        selector.value = false;
    }
}
function removeWheel() {
    if (wheel) wheel = wheel.remove();
}
function shapeCreateEnd() { // 造图结束
    if (newShape) {
        removeCreator();
        newShape = undefined;
    }
}
function removeCreator() { // 移除创造器
    if (asyncCreator) {
        asyncCreator = asyncCreator.close();
    }
    workspace.value.setAction(Action.AutoV);
    workspace.value.creating(false);
}
// 窗口失焦 
function windowBlur() {
    shapeCreateEnd();
    selectEnd();
    removeWheel();
    isMouseLeftPress = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
}

const commentPosition: ClientXY = reactive({ x: 0, y: 0 });
type CommentInputEl = InstanceType<typeof CommentInput>;
const commentEl = ref<CommentInputEl>();
const rootWidth = ref(root.value && root.value.clientWidth)
const pageID = ref(props.page.id)
const shapeID = ref('')
const shapePosition: ClientXY = reactive({ x: 0, y: 0 });
const documentCommentList = ref<any[]>([])
const route = useRoute()
const docID = (route.query.id as string)
const posi = ref({ x: 0, y: 0 });
const commentsLength = ref(0)
//添加评论
const addComment = (e: MouseEvent) => {
    e.stopPropagation()
    if(workspace.value.isCommentInput && e.target instanceof Element && !e.target.closest(`.comment-mark-item`)) {
        workspace.value.commentInput(false)
        return
    }else if (e.target instanceof Element && e.target.closest(`.comment-mark-item`)) {
        return
    }
    if(commentInput.value) return
    const { x, y } = workspace.value.root;
    const xy = matrix.inverseCoord(e.clientX - x, e.clientY - y);
    const shapes = props.context.selection.getShapesByXY_beta(xy, false, false);
    if(shapes.length === 0) { //点击的位置是否有图形
        shapePosition.x = 0;
        shapePosition.y = 0;
        shapeID.value = props.page.id
    }else {
        const shape = shapes[0]
        const m = shape.matrix2Page()
        const farmeXY = m.computeCoord({x: shape.frame.x, y: shape.frame.y })   
        shapePosition.x = xy.x - farmeXY.x; //评论输入框相对于shape的距离
        shapePosition.y = xy.y - farmeXY.y;
        shapeID.value = shape.id
    }
    commentPosition.x = xy.x; //评论输入框在页面的坐标
    commentPosition.y = xy.y;
    posi.value.x = e.clientX - x // 评论弹出框的位置坐标
    posi.value.y = e.clientY - y
    commentInput.value = true;
    rootWidth.value = root.value && root.value.clientWidth
    document.addEventListener('keydown', commentEsc);
}

const getCommentInputXY = (e: MouseEvent) => {
    const { x, y } = workspace.value.root;
    const xy = matrix.inverseCoord(e.clientX - x, e.clientY - y);
    commentPosition.x = xy.x - 10;
    commentPosition.y = xy.y + 10;
    posi.value.x = e.clientX - x
    posi.value.y = e.clientY - y
}

const commentEsc = (e: KeyboardEvent) => {
    if (e.code === 'Escape') {
        document.removeEventListener('keydown', commentEsc);
        commentInput.value = false;
    }
}
//移动输入框
const mouseDownCommentInput = (e: MouseEvent) => {
    document.addEventListener("mousemove", mouseMoveInput);
    document.addEventListener("mouseup", mouseUpCommentInput);
}

const mouseMoveInput = (e: MouseEvent) => {
    e.stopPropagation()
    getCommentInputXY(e)
}

const mouseUpCommentInput = () => {
    document.removeEventListener('mousemove', mouseMoveInput);
    document.removeEventListener('mouseup', mouseUpCommentInput);
}

const editCommentId = ref('')
const commentIndex = ref()
const downOnPageXY: ClientXY = reactive({ x: 0, y: 0 });
//移动评论
const downMoveCommentPopup = (e: MouseEvent, index: number) => {
    setMousedownXY(e); // 记录鼠标点下的位置（相对于page）
    const {x, y} = getMouseOnPageXY(e)
    downOnPageXY.x = x
    downOnPageXY.y = y
    workspace.value.commentMove(false)
    editCommentId.value = documentCommentList.value[index].id
    commentIndex.value = index
    const handleMouseMove = (e: MouseEvent) => {
        moveCommentPopup(e, index);
    };

    const handleMouseUp = (e: MouseEvent) => {
        const { x, y } = workspace.value.root;
        const xy = matrix.inverseCoord(e.clientX - x, e.clientY - y);
        const shapes = props.context.selection.getShapesByXY_beta(xy, false, false);
        const deltaX = Math.abs(xy.x - mousedownOnPageXY.x);
        const deltaY = Math.abs(xy.y - mousedownOnPageXY.y);
        const diff = Math.hypot(deltaX, deltaY);
        const shape_frame = documentCommentList.value[index].shape_frame
        shape_frame.x1 = shape_frame.x1 + (xy.x - mousedownOnPageXY.x)
        shape_frame.y1 = shape_frame.y1 + (xy.y - mousedownOnPageXY.y)
        workspace.value.commentMove(false)
            if(shapes.length === 0) {
                const data = {
                    id: editCommentId.value,
                    target_shape_id: props.page.id,
                    shape_frame: {
                        x1: shape_frame.x1,
                        y1: shape_frame.y1,
                        x2: 0,
                        y2: 0
                    }
                }
                editCommentPosition(data)
            }else {
                const shape = shapes[0]
                const m = shape.matrix2Page()
                const farmeXY = m.computeCoord({x: shape.frame.x, y: shape.frame.y }) 
                const data = {
                    id: editCommentId.value,
                    target_shape_id: shape.id,
                    shape_frame: {
                        x1: shape_frame.x1,
                        y1: shape_frame.y1,
                        x2: shape_frame.x1 - farmeXY.x,
                        y2: shape_frame.y1 - farmeXY.y
                    }
                }
                editCommentPosition(data)
            }
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
    };

  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
};
const commentReflush = ref(0)
const moveCommentPopup = (e: MouseEvent, index: number) => {
    commentReflush.value++
    const { x, y } = workspace.value.root;
    const xy = matrix.inverseCoord(e.clientX - x, e.clientY - y);
    const deltaX = Math.abs(xy.x - downOnPageXY.x);
    const deltaY = Math.abs(xy.y - downOnPageXY.y);
    const diff = Math.hypot(deltaX, deltaY);
    if(diff > 3) {
        props.context.workspace.commentMove(true)
    }
    const shape_frame = documentCommentList.value[index].shape_frame
    shape_frame.x1 = shape_frame.x1 + (xy.x - mousedownOnPageXY.x)
    shape_frame.y1 = shape_frame.y1 + (xy.y - mousedownOnPageXY.y)
    setMousedownXY(e);
};

const editCommentPosition = async(data: any) => {
    try{
        await comment_api.editCommentAPI(data)
    }catch(err) {
        console.log(err);
    }
}

// 取消评论输入框
const closeComment = (e?: MouseEvent) => {
    if(!spacePressed.value) {
        if(e && e.target instanceof Element && e.target.closest(`.${cursorClass.value}`) && !e.target.closest('.container-popup')) {
            commentInput.value = false;
        }else if(!e) {
            commentInput.value = false;
        }
    }
}

// 调用评论API，并通知listTab组件更新评论列表
const completed = () => {
    workspace.value.sendComment()
    const timer = setTimeout(() => {
        getDocumentComment(docID)
        clearTimeout(timer)
        commentInput.value = false;
    }, 100);
}

// 获取评论列表
const getDocumentComment = async(id :string) => {
    try {
       const {data} = await comment_api.getDocumentCommentAPI({doc_id: id, page_id: pageID.value})
       data.forEach((obj: {childern: any[]}) => {
        obj.childern = []
       })
       documentCommentList.value = list2Tree(data, '')
       commentsLength.value = documentCommentList.value.length
    }catch(err) {
        console.log(err);
    }
}

// 列表转树
const list2Tree = (list: any, rootValue: string) => {
  const arr: any = []
  list.forEach((item: any) => {
    if (item.parent_id === rootValue) {
      const children = list2Tree(list, item.id)
      if (children.length) {
        item.children = children
      }
      arr.push(item)
    }
  })
  return arr
}

// 删除评论
const deleteComment = (index :number) => {
    workspace.value.sendComment()
    documentCommentList.value.splice(index, 1)
}

//解决评论
const resolve = (status: number, index: number) => {
    workspace.value.sendComment()
    documentCommentList.value[index].status = status
}

//回复评论
const recover = () => {
    workspace.value.sendComment()
}

//修改评论内容
const editComment = (index: number, text: string) => {
    workspace.value.sendComment()
    documentCommentList.value[index].content = text
}

// hooks
function initMatrix(cur: Page) {
    let info = matrixMap.get(cur.id);
    if (!info) {
        const m = new Matrix();
        m.trans(-cur.frame.x, -cur.frame.y)
        info = { m, x: cur.frame.x, y: cur.frame.y }
        matrixMap.set(cur.id, info)
    }
    matrix.reset(info.m.toArray())
}
const stopWatch = watch(() => props.page, (cur, old) => {
    old.unwatch(watcher)
    cur.watch(watcher)
    let info = matrixMap.get(old.id);
    info!.m.reset(matrix.toArray())
    initMatrix(cur)
})
const resizeObserver = new ResizeObserver(() => { // 监听contentView的Dom frame变化
    root.value && updateRoot(props.context, root.value);
})
renderinit().then(() => {
    inited.value = true;
    nextTick(() => { root.value && resizeObserver.observe(root.value) });
})
onMounted(() => {
    initMatrix(props.page);
    props.context.workspace.watch(workspaceUpdate);
    props.page.watch(watcher);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    window.addEventListener('blur', windowBlur);
    stylerForCursorMount();
    rootRegister(true);
    props.context.selection.scoutMount(); // 用于hover判定
    getDocumentComment(docID)
})
onUnmounted(() => {
    props.context.workspace.unwatch(workspaceUpdate);
    props.page.unwatch(watcher);
    document.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("keyup", onKeyUp);
    window.removeEventListener('blur', windowBlur);
    styler.value.remove();
    rootRegister(false);
    stopWatch();
    props.context.selection.scout?.remove();
    resizeObserver.disconnect();
})
</script>
<template>
    <div v-if="inited" :class="cursorClass" :data-area="rootId" ref="root" :reflush="reflush !== 0 ? reflush : undefined"
        @wheel="onMouseWheel" @mousedown="onMouseDown" @mousemove="onMouseMove_CV" @mouseleave="onMouseLeave">
        <PageView :context="props.context" :data="(props.page as Page)" :matrix="matrix.toArray()" />
        <SelectionView :context="props.context" :matrix="matrix.toArray()" />
        <ContextMenu v-if="contextMenu" :x="contextMenuPosition.x" :y="contextMenuPosition.y" @mousedown.stop
            :context="props.context" @close="contextMenuUnmount" :site="site" ref="contextMenuEl">
            <PageViewContextMenuItems :items="contextMenuItems" :layers="shapesContainsMousedownOnPageXY"
                :context="props.context" @close="contextMenuUnmount" :site="site">
            </PageViewContextMenuItems>
        </ContextMenu>
        <Selector v-if="selector" :selector-frame="selectorFrame" :context="props.context"></Selector>
        <CommentInput v-if="commentInput" :context="props.context" :x1="commentPosition.x" :y1="commentPosition.y" 
        :pageID="pageID" :shapeID="shapeID" ref="commentEl" :rootWidth="rootWidth" @close="closeComment" @mouseDownCommentInput="mouseDownCommentInput" 
        :matrix="matrix.toArray()" :x2="shapePosition.x" :y2="shapePosition.y" @completed="completed" :posi="posi"></CommentInput>
        <PageCommentItem :context="props.context" :x="posi.x" @moveCommentPopup="downMoveCommentPopup" :y="posi.y" :matrix="matrix.toArray()"
         @delete-comment="deleteComment" @resolve="resolve" :reflush="commentReflush" v-for="(item, index) in documentCommentList" :key="index" 
         :commentInfo="item" :index="index" :length="commentsLength" @recover="recover" @editComment="editComment" :documentComment="documentCommentList">
        </PageCommentItem>
    </div>
</template>
<style scoped lang="scss">
div {
    background-color: var(--center-content-bg-color);
}
</style>