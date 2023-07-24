<script setup lang="ts">
import { reactive, onMounted, onUnmounted, computed, ref, nextTick, watch } from 'vue';
import PageView from './Content/PageView.vue';
import SelectionView from './Selection/SelectionView.vue';
import ContextMenu from '../common/ContextMenu.vue';
import PageViewContextMenuItems from '@/components/Document/Menu/PageViewContextMenuItems.vue';
import Selector, { SelectorFrame } from './Selection/Selector.vue';
import CommentInput from './Content/CommentInput.vue';
import CommentView from './Content/CommentView.vue';
import { Matrix, Shape, Page, ShapeFrame, AsyncCreator, ShapeType, Color, Artboard } from '@kcdesign/data';
import { Context } from '@/context'; // 状态顶层 store
import { PageXY, ClientXY, ClientXYRaw } from '@/context/selection'; // selection
import { KeyboardKeys, Perm, WorkSpace } from '@/context/workspace'; // workspace
import { Menu } from '@/context/menu'; // menu 菜单相关
import { useRoute } from 'vue-router';
import { debounce } from 'lodash';
import { useI18n } from 'vue-i18n';
import { v4 as uuid } from "uuid";
import { init as renderinit } from '@/render';
import { fourWayWheel, Wheel, EffectType } from '@/utils/wheel';
import { _updateRoot, getName, init_shape, color2string, init_insert_shape, is_drag, insert_imgs, drop, right_select, adapt_page, list2Tree, flattenShapes, get_menu_items, selectShapes } from '@/utils/content';
import { paster } from '@/utils/clipaboard';
import { collect, insertFrameTemplate } from '@/utils/artboardFn';
import { searchCommentShape } from '@/utils/comment';
import * as comment_api from '@/apis/comment';
import { Comment } from '@/context/comment';
import Placement from './Menu/Placement.vue';
import TextSelection from './Selection/TextSelection.vue';
import { Cursor } from "@/context/cursor";
import { Action } from "@/context/tool";

interface Props {
    context: Context
    page: Page
}
type ContextMenuEl = InstanceType<typeof ContextMenu>;
const { t } = useI18n();
const props = defineProps<Props>();
const STATE_NONE = 0;
const STATE_CHECKMOVE = 1;
const STATE_MOVEING = 2;
const workspace = computed(() => props.context.workspace);
const comment = computed(() => props.context.comment);
let scale_delta = 1.06;
let scale_delta_ = 1 / scale_delta;
const wheel_step = 50;
const spacePressed = ref<boolean>(false);
const contextMenu = ref<boolean>(false);
const contextMenuPosition: ClientXY = reactive({ x: 0, y: 0 });
let state = STATE_NONE;
const dragActiveDis = 4; // 拖动 3px 后开始触发移动
const prePt: { x: number, y: number } = { x: 0, y: 0 };
const matrix = reactive(props.context.workspace.matrix);
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
const selector_mount = ref<boolean>(false);
const selectorFrame = ref<SelectorFrame>({ top: 0, left: 0, width: 0, height: 0, includes: false });
const cursor = ref<string>('');
const rootId = ref<string>('content');
let wheel: Wheel | undefined;
let asyncCreator: AsyncCreator | undefined;
let isMouseLeftPress: boolean = false; // 针对在contentview里面
const commentInput = ref(false);
const resizeObserver = new ResizeObserver(frame_watcher);
const background_color = ref<string>('rgba(239,239,239,1)');
function rootRegister(mount: boolean) {
    if (mount) {
        const id = (uuid().split('-').at(-1)) || 'content';
        rootId.value = id;
    } else rootId.value = 'content';
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
function onMouseWheel(e: WheelEvent) { // 滚轮、触摸板事件
    if (contextMenu.value) return; //右键菜单已打开
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
    search_once(e) // 滚动过程进行常规图形检索
    workspace.value.pageDragging(true);
    workspace.value.matrixTransformation();
    de_freeze();
}
const de_freeze = debounce(() => {
    workspace.value.pageDragging(false);
}, 50)
function onKeyDown(e: KeyboardEvent) { // 键盘监听
    if (e.code === KeyboardKeys.Space) {
        if (workspace.value.select || spacePressed.value) return;
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
    props.context.cursor.setType('grab-0');
}
function endDragPage() { // 编辑器完成拖动页面
    spacePressed.value = false;
    workspace.value.pageDragging(false);
    props.context.cursor.reset();
}
function pageEditorOnMoveEnd(e: MouseEvent) {
    const action = props.context.tool.action;
    if (action === Action.AddComment) return addComment(e);
    if (commentInput.value) commentInput.value = false;
    const isDrag = is_drag(props.context, e, mousedownOnClientXY, 2 * dragActiveDis);
    if (isDrag && newShape) shapeCreateEnd();
    else {
        if (newShape) shapeCreateEnd();
        else if (action.startsWith('add')) init_insert_shape(props.context, mousedownOnPageXY, t);
    }
}
function contentEditOnMoving(e: MouseEvent) { // 编辑page内容    
    const { x, y } = getMouseOnPageXY(e);
    if (newShape) {
        if (wheel && asyncCreator) {
            const isOut = wheel.moving(e, { type: EffectType.NEW_SHAPE, effect: asyncCreator.setFrameByWheel });
            if (!isOut) asyncCreator.setFrame({ x, y });
        }
    } else {
        const isDrag = is_drag(props.context, e, mousedownOnClientXY, 2 * dragActiveDis);
        if (isDrag) {
            const shapeFrame = new ShapeFrame(x, y, 1, 1);
            const result = init_shape(props.context, shapeFrame, mousedownOnPageXY, t);
            if (result) {
                asyncCreator = result.asyncCreator;
                newShape = result.new_shape;
            }
        }
    }
}
function workspace_watcher(type?: number, param?: string | MouseEvent | Color) {
    if (type === WorkSpace.MATRIX_TRANSFORMATION) matrix.reset(workspace.value.matrix);
    else if (type === WorkSpace.INSERT_FRAME) insertFrame();
    else if (type === WorkSpace.INSERT_IMGS) insert_imgs(props.context, t);
    else if (type === WorkSpace.PASTE) paster(props.context, t);
    else if (type === WorkSpace.PASTE_RIGHT) paster(props.context, t, mousedownOnPageXY);
    else if (type === WorkSpace.COPY) props.context.workspace.clipboard.write_html();
    else if ((type === WorkSpace.ONARBOARD__TITLE_MENU) && param) contextMenuMount((param as MouseEvent));
    else if ((type === WorkSpace.CHANGE_BACKGROUND) && param) background_color.value = color2string(param as Color);
}
function comment_watcher(type?: number) {
    if (type === Comment.UPDATE_COMMENT_POS) saveShapeCommentXY();
    else if (type === Comment.UPDATE_PAGE_COMMENT) documentCommentList.value = props.context.comment.pageCommentList;
    else if (type === Comment.UPDATE_COMMENT) {
        props.context.comment.updateCommentList(props.page.id)
        documentCommentList.value = props.context.comment.pageCommentList
    }
}
function menu_watcher(type?: number) {
    if (type === Menu.SHUTDOWN_MENU) contextMenuUnmount();
}
function insertFrame() {
    const brothers = props.context.selection.selectedPage?.childs || [];
    const name = getName(ShapeType.Artboard, brothers, t);
    insertFrameTemplate(props.context, name);
}
function _search(auto: boolean) { // 支持阻止子元素冒泡的图形检索
    const { x, y } = workspace.value.root;
    const { x: mx, y: my } = mouseOnClient;
    const xy: PageXY = matrix.inverseCoord(mx - x, my - y);
    const shapes = props.context.selection.getShapesByXY(xy, auto);
    selectShapes(props.context, shapes);
}
function search(e: MouseEvent) { // 常规图形检索
    if (props.context.workspace.transforming) return; // 编辑器编辑过程中不再判断其他未选择的shape的hover状态
    const { clientX, clientY, metaKey, ctrlKey } = e;
    const { x, y } = workspace.value.root;
    const xy = matrix.inverseCoord(clientX - x, clientY - y);
    const shapes = props.context.selection.getShapesByXY(xy, metaKey || ctrlKey); // xy: PageXY
    selectShapes(props.context, shapes);
}
const search_once = debounce(search, 50) // 连续操作结尾处调用
function pageViewDragStart(e: MouseEvent) {
    state = STATE_CHECKMOVE;
    prePt.x = e.screenX;
    prePt.y = e.screenY;
}
function pageViewDragging(e: MouseEvent) {
    if (workspace.value.controller !== 'page') return;
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
    workspace.value.notify(WorkSpace.MATRIX_TRANSFORMATION);
    props.context.cursor.setType('grabbing-0');
}
function pageViewDragEnd() {
    state = STATE_NONE;
    props.context.cursor.setType('grab-0')
}
function contextMenuMount(e: MouseEvent) {
    const workspace = props.context.workspace;
    const selection = props.context.selection;
    const menu = props.context.menu;
    menu.menuMount();
    selection.unHoverShape();
    site.x = e.clientX
    site.y = e.clientY
    const { x, y } = workspace.root;
    contextMenuPosition.x = e.clientX - x;
    contextMenuPosition.y = e.clientY - y;
    setMousedownXY(e); // 更新鼠标定位
    contextMenuItems = [];
    const area = right_select(e, mousedownOnPageXY, props.context); // 判断点击环境
    contextMenuItems = get_menu_items(props.context, area); // 根据点击环境确定菜单选项
    const shapes = selection.getLayers(mousedownOnPageXY);
    if (shapes.length > 1 && area !== 'text-selection') {
        shapesContainsMousedownOnPageXY.length = 0;
        shapesContainsMousedownOnPageXY = shapes;
        contextMenuItems.push('layers');
    }
    contextMenu.value = true; // 数据准备就绪之后打开菜单
    menu.menuMount('content');
    document.addEventListener('keydown', esc);
    // 打开菜单之后调整菜单位置
    nextTick(() => {
        if (contextMenuEl.value) {
            const el = contextMenuEl.value.menu;
            surplusY.value = document.documentElement.clientHeight - site.y;
            const root_height = props.context.workspace.root.height;

            if (el) {
                let height = el.offsetHeight;
                if (height > root_height * 0.98) {
                    height = root_height * 0.98;
                    el.style.height = height + 'px';
                }
                if (surplusY.value - 4 < height) {
                    surplusY.value = document.documentElement.clientHeight - site.y - 4;
                    el.style.top = contextMenuPosition.y + surplusY.value - height + 'px';
                }
            }
        }
    })
}
function esc(e: KeyboardEvent) {
    if (e.code === 'Escape') contextMenuUnmount();
}
function contextMenuUnmount() {
    contextMenu.value = false;
    document.removeEventListener('keydown', esc);
}
function select(e: MouseEvent) {
    if (props.context.workspace.select) {
        createSelector(e);
    } else {
        const isDrag = is_drag(props.context, e, mousedownOnPageXY, 3 * dragActiveDis);
        if (isDrag) {
            props.context.workspace.selecting(true);
        }
    }
}
function createSelector(e: MouseEvent) { // 创建一个selector框选器
    const { clientX, clientY, altKey } = e;
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
    selectorFrame.value.includes = altKey;
    selector_mount.value = true;
}
function wheelSetup() { // 安装滚轮
    wheel = fourWayWheel(props.context, { rolling: undefined }, mousedownOnPageXY);
}
function updateMouse(e: MouseEvent) {
    const { clientX, clientY } = e;
    mouseOnClient.x = clientX;
    mouseOnClient.y = clientY;
}
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
            const action = props.context.tool.action;
            if (action !== Action.AddComment) {
                if (commentInput.value) {
                    commentInput.value = false;
                }
            }
        }
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    } else if (e.button == 2) { // 右键按下，右键菜单处理
        e.stopPropagation();
        const action = props.context.tool.action;
        if (action === Action.AddComment) return;
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
                const action = props.context.tool.action;
                if (action !== Action.AutoV && action !== Action.AddComment) {
                    if (props.context.workspace.documentPerm !== Perm.isEdit) return;
                    contentEditOnMoving(e); // 新增图形、切片     
                }
            }
        }
    }
}
// mousemove(target：contentview) 
function onMouseMove_CV(e: MouseEvent) {
    if (workspace.value.controller === 'page') {
        if (!spacePressed.value) {
            const action = props.context.tool.action;
            if (e.buttons === 1) {
                if (action === Action.AutoV && isMouseLeftPress) {
                    select(e); // 选区
                }
            } else if (e.buttons === 0) {
                if (action === Action.AutoV) {
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
        if (spacePressed.value) pageViewDragEnd();
        else {
            pageEditorOnMoveEnd(e);
            selectEnd();
            removeWheel();
            isMouseLeftPress = false;
            saveShapeCommentXY()
        }
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }
}
//移动shape时保存shape身上的评论坐标
const saveShapeCommentXY = () => {
    const shapes = comment.value.commentShape
    const sleectShapes = flattenShapes(shapes)
    const commentList = props.context.comment.pageCommentList
    sleectShapes.forEach((item: any) => {
        commentList.forEach((comment: any, i: number) => {
            if (comment.target_shape_id === item.id) {
                editShapeComment(i, comment.shape_frame.x1, comment.shape_frame.y1)
            }
        })
    })
    comment.value.editShapeComment(false, undefined)
}

// mouseleave
function onMouseLeave() {
    props.context.selection.unHoverShape();
}
// #endregion
function selectEnd() {
    if (props.context.workspace.select) {
        props.context.workspace.selecting(false);
        selector_mount.value = false;
    }
}
function removeWheel() {
    if (wheel) wheel = wheel.remove();
}
function shapeCreateEnd() { // 造图结束
    if (newShape) {
        if (newShape.type === ShapeType.Text) { // 文本框新建则进入编辑状态
            const workspace = props.context.workspace;
            workspace.notify(WorkSpace.INIT_EDITOR);
        } else if (newShape.type === ShapeType.Artboard) { // 容器创建需要收束
            const childs = collect(props.context);
            const page = props.context.selection.selectedPage;
            if (page && asyncCreator) asyncCreator.collect(page, childs, props.context.selection.selectedShapes[0] as Artboard);
        }
        removeCreator();
        newShape = undefined;
    }
}
function removeCreator() { // 移除创造器
    if (asyncCreator) asyncCreator = asyncCreator.close();
    props.context.workspace.creating(false);
    props.context.tool.setAction(Action.AutoV);
    props.context.cursor.setType("auto-0");
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
const shapeID = ref('')
const shapePosition: ClientXY = reactive({ x: 0, y: 0 });
const documentCommentList = ref<any[]>(comment.value.pageCommentList)
const route = useRoute()
const posi = ref({ x: 0, y: 0 });
type commentListMenu = {
    text: string
    status_p: boolean
}
// 左侧评论列表的菜单
const commentMenuItems = ref<commentListMenu[]>([
    { text: `${t('comment.sort')}`, status_p: false },
    { text: `${t('comment.show_about_me')}`, status_p: false },
    { text: `${t('comment.show_resolved_comments')}`, status_p: props.context.selection.commentStatus || false }
])

const detectionShape = (e: MouseEvent) => {
    const { x, y } = workspace.value.root;
    const xy = matrix.inverseCoord(e.clientX - x, e.clientY - y);
    const shapes = searchCommentShape(props.context, xy);
    if (shapes.length === 0) { //点击的位置是否有图形
        shapePosition.x = 0
        shapePosition.y = 0
        shapeID.value = props.page.id
    } else {
        const shape = shapes[0]
        const fp = shape.frame2Root();
        const farmeXY = { x: fp.x, y: fp.y }
        shapePosition.x = xy.x - farmeXY.x //评论输入框相对于shape的距离
        shapePosition.y = xy.y - farmeXY.y
        shapeID.value = shape.id
    }
    return { x, y, xy }
}

//添加评论
const addComment = (e: MouseEvent) => {
    e.stopPropagation()
    if (comment.value.isCommentInput && e.target instanceof Element && !e.target.closest(`.comment-mark-item`)) {
        comment.value.commentOpacity(false)
        comment.value.commentInput(false)
        return
    } else if (e.target instanceof Element && e.target.closest(`.comment-mark-item`)) {
        return
    }
    if (commentInput.value) return
    const { x, y, xy } = detectionShape(e)
    commentPosition.x = xy.x; //评论输入框在页面的坐标
    commentPosition.y = xy.y;
    posi.value.x = e.clientX - x // 评论弹出框的位置坐标
    posi.value.y = e.clientY - y
    commentInput.value = true;
    rootWidth.value = root.value && root.value.clientWidth
    document.addEventListener('keydown', commentEsc);
}

const getCommentInputXY = (e: MouseEvent) => {
    const { x, y, xy } = detectionShape(e)
    commentPosition.x = xy.x;
    commentPosition.y = xy.y;
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

const mouseUpCommentInput = (e: MouseEvent) => {
    detectionShape(e)
    document.removeEventListener('mousemove', mouseMoveInput);
    document.removeEventListener('mouseup', mouseUpCommentInput);
}

const editShapeComment = (index: number, x: number, y: number) => {
    const comment = documentCommentList.value[index]
    const id = comment.id
    const shapeId = comment.target_shape_id
    const { x2, y2 } = comment.shape_frame
    const data = {
        id: id,
        target_shape_id: shapeId,
        shape_frame: {
            x1: x,
            y1: y,
            x2: x2,
            y2: y2
        }
    }
    editCommentShapePosition(data)
}
const editCommentShapePosition = async (data: any) => {
    try {
        await comment_api.editCommentAPI(data)
    } catch (err) {
        console.log(err);
    }
}

// 取消评论输入框
const closeComment = (e?: MouseEvent) => {
    if (!spacePressed.value) {
        if (e && e.target instanceof Element && e.target.closest(`.${cursor.value}`) && !e.target.closest('.container-popup')) {
            commentInput.value = false;
        } else if (!e) {
            commentInput.value = false;
        }
    }
}

// 调用评论API，并通知listTab组件更新评论列表
const completed = () => {
    comment.value.sendComment()
    const timer = setTimeout(() => {
        getDocumentComment()
        clearTimeout(timer)
        commentInput.value = false;
    }, 150);
}

// 获取评论列表
const getDocumentComment = async () => {
    try {
        const { data } = await comment_api.getDocumentCommentAPI({ doc_id: route.query.id })
        if (data) {
            data.forEach((obj: { children: any[]; commentMenu: any; }) => {
                obj.commentMenu = commentMenuItems.value
                obj.children = []
            })
            const manageData = data.map((item: any) => {
                item.content = item.content.replaceAll("\r\n", "<br/>").replaceAll("\n", "<br/>").replaceAll(" ", "&nbsp;")
                return item
            })
            const list = list2Tree(manageData, '')
            comment.value.setNot2TreeComment(manageData)
            comment.value.setPageCommentList(list, props.page.id)
            comment.value.setCommentList(list)
            documentCommentList.value = comment.value.pageCommentList
            if (props.context.selection.isSelectComment) {
                props.context.selection.selectComment(props.context.selection.commentId)
                documentCommentList.value = comment.value.pageCommentList
                props.context.selection.setCommentSelect(false)
            }
        }
    } catch (err) {
        console.log(err);
    }
}
// hooks
function initMatrix(cur: Page) {
    let info = matrixMap.get(cur.id);
    if (!info) {
        const m = new Matrix(adapt_page(props.context));
        info = { m, x: cur.frame.x, y: cur.frame.y };
        matrixMap.set(cur.id, info);
    }
    matrix.reset(info.m.toArray());
    workspace.value.matrixTransformation();
}
const stopWatch = watch(() => props.page, (cur, old) => {
    old.unwatch(watcher)
    cur.watch(watcher)
    let info = matrixMap.get(old.id);
    info!.m.reset(matrix.toArray())
    initMatrix(cur)
})
function frame_watcher() {
    if (!root.value) return;
    _updateRoot(props.context, root.value);
}
function cursor_watcher(t?: number, type?: string) {
    if ((t === Cursor.RESET || t === Cursor.CHANGE_CURSOR) && type) {
        cursor.value = type;
    }
}
onMounted(() => {
    props.context.selection.scoutMount(props.context);
    props.context.workspace.watch(workspace_watcher);
    props.context.workspace.init(t);
    props.context.workspace.setFreezeStatus(true);
    props.context.comment.watch(comment_watcher);
    props.context.menu.watch(menu_watcher);
    props.context.cursor.watch(cursor_watcher);
    props.context.cursor.init();
    props.page.watch(watcher);
    rootRegister(true);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', windowBlur);
    renderinit().then(() => {
        inited.value = true;
        nextTick(() => {
            if (root.value) {
                resizeObserver.observe(root.value);
                _updateRoot(props.context, root.value); // 第一次记录root数据，所有需要root数据的方法，都需要在此之后
                initMatrix(props.page); // 初始化页面视图
            }
        });
    }).catch((e) => { console.log(e) }).finally(() => { props.context.workspace.setFreezeStatus(false) });
})
onUnmounted(() => {
    props.context.selection.scout?.remove();
    props.context.workspace.unwatch(workspace_watcher);
    props.context.comment.unwatch(comment_watcher);
    props.context.menu.unwatch(menu_watcher);
    props.context.cursor.unwatch(cursor_watcher);
    props.page.unwatch(watcher);
    resizeObserver.disconnect();
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('blur', windowBlur);
    stopWatch();
})
</script>
<template>
    <div v-if="inited" :class="cursor" :data-area="rootId" ref="root" :reflush="reflush !== 0 ? reflush : undefined"
        @wheel="onMouseWheel" @mousedown="onMouseDown" @mousemove="onMouseMove_CV" @mouseleave="onMouseLeave"
        @drop="(e: DragEvent) => { drop(e, props.context, t) }" @dragover.prevent
        :style="{ 'background-color': background_color }">
        <PageView :context="props.context" :data="(props.page as Page)" :matrix="matrix.toArray()" />
        <TextSelection :context="props.context" :matrix="matrix.toArray()"> </TextSelection>
        <SelectionView :context="props.context" :matrix="matrix.toArray()" />
        <ContextMenu v-if="contextMenu" :x="contextMenuPosition.x" :y="contextMenuPosition.y" @mousedown.stop
            :context="props.context" @close="contextMenuUnmount" :site="site" ref="contextMenuEl">
            <PageViewContextMenuItems :items="contextMenuItems" :layers="shapesContainsMousedownOnPageXY"
                :context="props.context" @close="contextMenuUnmount" :site="site">
            </PageViewContextMenuItems>
        </ContextMenu>
        <Placement v-if="contextMenu" :x="contextMenuPosition.x" :y="contextMenuPosition.y" :context="props.context">
        </Placement>
        <Selector v-if="selector_mount" :selector-frame="selectorFrame" :context="props.context"></Selector>
        <CommentInput v-if="commentInput" :context="props.context" :x1="commentPosition.x" :y1="commentPosition.y"
            :pageID="page.id" :shapeID="shapeID" ref="commentEl" :rootWidth="rootWidth" @close="closeComment"
            @mouseDownCommentInput="mouseDownCommentInput" :matrix="matrix.toArray()" :x2="shapePosition.x"
            :y2="shapePosition.y" @completed="completed" :posi="posi"></CommentInput>
        <CommentView :context="props.context" :pageId="page.id" :page="page" :root="root" :cursorClass="cursor">
        </CommentView>
    </div>
</template>