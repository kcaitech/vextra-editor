<script setup lang="ts">
import { reactive, onMounted, onUnmounted, computed, ref, nextTick, watch } from 'vue';
import PageView from './Content/PageView.vue';
import SelectionView from './Selection/SelectionView.vue';
import ContextMenu from '../common/ContextMenu.vue';
import PageViewContextMenuItems from '@/components/Document/Menu/PageViewContextMenuItems.vue';
import Selector, { SelectorFrame } from './Selection/Selector.vue';
import CommentView from './Content/CommentView.vue';
import { Matrix, Shape, Page, Color } from '@kcdesign/data';
import { Context } from '@/context';
import { PageXY, ClientXY, ClientXYRaw } from '@/context/selection';
import { KeyboardKeys, WorkSpace } from '@/context/workspace';
import { collect_once } from '@/utils/assist';
import { Menu } from '@/context/menu';
import { debounce } from 'lodash';
import { useI18n } from 'vue-i18n';
import { v4 as uuid } from "uuid";
import {
  _updateRoot,
  is_drag,
  drop,
  right_select,
  adapt_page,
  flattenShapes,
  get_menu_items,
  selectShapes,
  color2string,
  init_insert_table,
  root_scale, root_trans
} from '@/utils/content';
import { paster } from '@/utils/clipboard';
import { insertFrameTemplate } from '@/utils/artboardFn';
import { Comment } from '@/context/comment';
import Placement from './Menu/Placement.vue';
import TextSelection from './Selection/TextSelection.vue';
import { Cursor } from "@/context/cursor";
import { Action, Tool } from "@/context/tool";
import { initpal } from './initpal';
import UsersSelection from './Selection/TeamWork/UsersSelection.vue';
import CellSetting from '@/components/Document/Menu/TableMenu/CellSetting.vue';
import * as comment_api from '@/apis/comment';
// import Overview from './Content/Overview.vue';
import Creator from './Creator.vue';
import { TaskType } from '@/context/escstack';
import { Wheel, EffectType, fourWayWheel } from '@/utils/wheel';
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
const matrix: Matrix = reactive(props.context.workspace.matrix as any);
const matrixMap = new Map<string, { m: Matrix, x: number, y: number }>();
const reflush = ref(0);
const inited = ref(false);
const root = ref<HTMLDivElement>();
const mousedownOnClientXY: ClientXY = { x: 0, y: 0 }; // 鼠标在可视区中的坐标
const mousedownOnPageXY: PageXY = { x: 0, y: 0 }; // 鼠标在page中的坐标
const mouseOnClient: ClientXYRaw = { x: 0, y: 0 }; // 没有减去根部节点
let shapesContainsMousedownOnPageXY: Shape[] = [];
let contextMenuItems: string[] = [];
const contextMenuEl = ref<ContextMenuEl>();
const surplusY = ref<number>(0);
const site: { x: number, y: number } = { x: 0, y: 0 };
const selector_mount = ref<boolean>(false);
const selectorFrame = ref<SelectorFrame>({ top: 0, left: 0, width: 0, height: 0, includes: false });
const cursor = ref<string>('');
const rootId = ref<string>('content');
let isMouseLeftPress: boolean = false; // 针对在contentview里面
const resizeObserver = new ResizeObserver(frame_watcher);
const background_color = ref<string>('rgba(239,239,239,1)');
const avatarVisi = ref(props.context.menu.isUserCursorVisible);
const cellSetting = ref(false);
const cellStatus = ref();
const creatorMode = ref<boolean>(false);
const documentCommentList = ref<any[]>(comment.value.pageCommentList)

// const overview = ref<boolean>(false);
let matrix_inverse: Matrix = new Matrix();

function page_watcher(...args: any) {
    if (args.includes('style')) {
        const f = props.page.style.fills[0];
        if (f) background_color.value = color2string(f.color);
    }
    reflush.value++
}
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
    const xy = matrix_inverse.computeCoord2(clientX - x, clientY - y);
    mousedownOnPageXY.x = xy.x, mousedownOnPageXY.y = xy.y; //页面坐标系上的点
    mousedownOnClientXY.x = clientX - x, mousedownOnClientXY.y = clientY - y; // 用户端可视区上的点
}

function onMouseWheel(e: WheelEvent) { // 滚轮、触摸板事件
    if (contextMenu.value) return; //右键菜单已打开
    e.preventDefault();
    const { ctrlKey, metaKey, deltaX, deltaY } = e;
    if (ctrlKey || metaKey) { // 缩放
      root_scale(props.context, e);
    } else {
        if (Math.abs(deltaX) + Math.abs(deltaY) < 150) { // 临时适配方案，需根据使用设备进一步完善适配
            matrix.trans(-deltaX, -deltaY);
        } else {
          root_trans(props.context, e, wheel_step);
        }
    }
    workspace.value.notify(WorkSpace.MATRIX_TRANSFORMATION);
    search_once(e) // 滚动过程进行常规图形检索
}
function onKeyDown(e: KeyboardEvent) { // 键盘监听
    if (e.target instanceof HTMLInputElement) return;
    if (e.code === KeyboardKeys.Space) {
        if (workspace.value.select || spacePressed.value) return;
        // overview.value = true;
        preToDragPage();
    } else if (e.code === 'MetaLeft' || e.code === 'ControlLeft') {
        _search(true); // 根据鼠标当前位置进行一次穿透式图形检索
    }
}
function onKeyUp(e: KeyboardEvent) {
    if (e.target instanceof HTMLInputElement) return;
    if (spacePressed.value && e.code === KeyboardKeys.Space) {
        // overview.value = false;
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
function workspace_watcher(type?: number, param?: string | MouseEvent | Color) {
    if (type === WorkSpace.MATRIX_TRANSFORMATION) matrix.reset(workspace.value.matrix);
    else if (type === WorkSpace.PASTE) paster(props.context, t);
    else if (type === WorkSpace.PASTE_RIGHT) paster(props.context, t, mousedownOnPageXY);
    else if (type === WorkSpace.COPY) props.context.workspace.clipboard.write_html();
    else if ((type === WorkSpace.ONARBOARD__TITLE_MENU) && param) contextMenuMount((param as MouseEvent));
}
function comment_watcher(type?: number) {
    if (type === Comment.UPDATE_COMMENT_POS) saveShapeCommentXY();
    else if (type === Comment.UPDATE_PAGE_COMMENT) documentCommentList.value = props.context.comment.pageCommentList;
    else if (type === Comment.UPDATE_COMMENT) {
        props.context.comment.updateCommentList(props.page.id)
        documentCommentList.value = props.context.comment.pageCommentList
    }
}
function menu_watcher(type?: number, mount?: string) {
    if (type === Menu.SHUTDOWN_MENU) contextMenuUnmount();
    if (type === Menu.CHANGE_USER_CURSOR) {
        avatarVisi.value = props.context.menu.isUserCursorVisible;
    } else if (type === Menu.OPEN_SPLIT_CELL) {
        cellStatus.value = mount;
        cellSetting.value = true;
    }
}
function tool_watcher(type: number) {
    if (type === Tool.CHANGE_ACTION) {
        creatorMode.value = props.context.tool.action.startsWith('add');
    }
    else if (type === Tool.INSERT_FRAME) insertFrame();
    else if (type === Tool.INSERT_TABLE) init_insert_table(props.context, t);
}
function insertFrame() {
    insertFrameTemplate(props.context);
}

function _search(auto: boolean) { // 支持阻止子元素冒泡的图形检索
    const { x, y } = workspace.value.root;
    const { x: mx, y: my } = mouseOnClient;
    const xy: PageXY = matrix_inverse.computeCoord2(mx - x, my - y);
    const shapes = props.context.selection.getShapesByXY(xy, auto);
    selectShapes(props.context, shapes);
}
function search(e: MouseEvent) { // 常规图形检索
    if (props.context.workspace.transforming) return; // 编辑器编辑过程中不再判断其他未选择的shape的hover状态
    const { clientX, clientY, metaKey, ctrlKey } = e;
    const { x, y } = workspace.value.root;
    const xy = matrix_inverse.computeCoord2(clientX - x, clientY - y);
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
    const workspace = props.context.workspace, selection = props.context.selection, menu = props.context.menu;
    menu.menuMount();
    selection.unHoverShape();
    site.x = e.clientX, site.y = e.clientY;
    const root = workspace.root;
    contextMenuPosition.x = e.clientX - root.x, contextMenuPosition.y = e.clientY - root.y;
    setMousedownXY(e); // 更新鼠标定位
    contextMenuItems = [];
    const area = right_select(e, mousedownOnPageXY, props.context); // 判断点击环境
    contextMenuItems = get_menu_items(props.context, area); // 根据点击环境确定菜单选项
    const shapes = selection.getLayers(mousedownOnPageXY);
    if (shapes.length > 1 && (area !== 'text-selection' && area !== 'table_cell')) {
        shapesContainsMousedownOnPageXY = shapes;
        contextMenuItems.push('layers');
    }
    if (area === 'table_cell') {
        const table = props.context.tableSelection;
        if (table.tableRowStart === table.tableRowEnd && table.tableColStart === table.tableColEnd) {
            contextMenuItems.push('split_cell');
            contextMenuItems = contextMenuItems.filter(item => item !== 'merge_cell');
        }
    }
    contextMenu.value = true; // 数据准备就绪之后打开菜单
    menu.menuMount('content');
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
            // eslint-disable-next-line
            props.context.esctask.save(TaskType.MENU, contextMenuUnmount); // 将关闭菜单事件加入到esc任务队列
        }
    })
}
function contextMenuUnmount() {
    const exe_result = contextMenu.value;
    contextMenu.value = false;
    return exe_result;
}
function select(e: MouseEvent) {
    if (props.context.workspace.select) {
        createSelector(e);
    } else {
        if (is_drag(props.context, e, mousedownOnPageXY, 3 * dragActiveDis)) props.context.workspace.selecting(true);
    }
}
function createSelector(e: MouseEvent) { // 创建一个selector框选器
    const { clientX, clientY, altKey } = e;
    const { x: rx, y: ry } = workspace.value.root;
    const xy = matrix_inverse.computeCoord2(clientX - rx, clientY - ry);
    const { x: mx, y: my } = { x: xy.x, y: xy.y };
    const { x: sx, y: sy } = mousedownOnPageXY;
    const left = Math.min(sx, mx);
    const right = Math.max(mx, sx);
    const top = Math.min(my, sy);
    const bottom = Math.max(my, sy);
    const p = matrix_inverse.inverseCoord({ x: left, y: top })
    const s = matrix_inverse.inverseCoord({ x: right, y: bottom })
    selectorFrame.value.top = Math.min(p.y, s.y);
    selectorFrame.value.left = Math.min(p.x, s.x);
    selectorFrame.value.width = Math.max(p.x, s.x) - Math.min(p.x, s.x);
    selectorFrame.value.height = Math.max(p.y, s.y) - Math.min(p.y, s.y);
    selectorFrame.value.includes = altKey;
    selector_mount.value = true;
}
function updateMouse(e: MouseEvent) {
    const { clientX, clientY } = e;
    mouseOnClient.x = clientX;
    mouseOnClient.y = clientY;
}
// mousedown(target：contentview)
function onMouseDown(e: MouseEvent) {
    if (workspace.value.transforming) return; // 当图形变换过程中不再接收新的鼠标点击事件
    if (e.button === 0) { // 左键按下
        const action = props.context.tool.action;
        if (action === Action.AddTable) return;
        setMousedownXY(e); // 记录鼠标点下的位置（相对于page）
        if (spacePressed.value) {
            pageViewDragStart(e); // 空格键press，准备拖动页面
        } else {
            isMouseLeftPress = true;
            wheel = fourWayWheel(props.context, undefined, mousedownOnPageXY);
        }
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    } else if (e.button === 2) { // 右键按下，右键菜单处理
        e.stopPropagation();
        const action = props.context.tool.action;
        if (action === Action.AddComment) return;
        contextMenuMount(e);
    }
}
// mousemove(target：document)
let timer: any = null;
function onMouseMove(e: MouseEvent) {
    if (workspace.value.controller == 'page') {
        if (e.buttons == 1 && spacePressed.value) pageViewDragging(e); // 拖拽页面
        if (isDragging && wheel) {
            wheel.moving(e);
            clearInterval(timer);
            timer = null;
            timer = setInterval(() => {
                createSelector(e);
            }, 6);
            createSelector(e);
        } else {
            isDragging = true;
        }
    }
}
// mousemove(target：contentview) 
let isDragging: boolean = false;
let wheel: Wheel | undefined = undefined;
function onMouseMove_CV(e: MouseEvent) {
    if (workspace.value.controller === 'page') {
        if (!spacePressed.value) {
            const action = props.context.tool.action;
            if (e.buttons === 1) {
                if (action === Action.AutoV && isMouseLeftPress) select(e);
            } else if (e.buttons === 0) {
                if (action === Action.AutoV || action === Action.AutoK) search(e); // 图形检索(hover)
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
            isMouseLeftPress = false;
            selectEnd();
            saveShapeCommentXY();
            if (selector_mount.value) {
                selectEnd();
            }
        }
        if (wheel) wheel = wheel.remove();
        isDragging = false;
        clearInterval(timer);
        timer = null;
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
// 窗口失焦 
function windowBlur() {
    selectEnd();
    isMouseLeftPress = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
}
const editShapeComment = (index: number, x: number, y: number) => {
    const comment = documentCommentList.value[index]
    const id = comment.id
    const shapeId = comment.target_shape_id
    const { x2, y2 } = comment.shape_frame
    const data = {
        id: id,
        target_shape_id: shapeId,
        shape_frame: { x1: x, y1: y, x2: x2, y2: y2 }
    }
    editCommentShapePosition(data)
}
const editCommentShapePosition = async (data: any) => {
    try {
        await comment_api.editCommentAPI(data)
    } catch (err) { console.log(err) }
}
//表格
const closeModal = () => {
    cellSetting.value = false
}

function frame_watcher() {
    if (!root.value) return;
    _updateRoot(props.context, root.value);
}
function cursor_watcher(t?: number, type?: string) {
    if ((t === Cursor.RESET || t === Cursor.CHANGE_CURSOR) && type) cursor.value = type;
}
function matrix_watcher(nm: Matrix) {
    matrix_inverse = new Matrix(nm.inverse);
    collect_once(props.context, nm);
}
// hooks
function initMatrix(cur: Page) {
    let info = matrixMap.get(cur.id);
    if (!info) {
        const m = new Matrix(adapt_page(props.context, true));
        info = { m, x: cur.frame.x, y: cur.frame.y };
        matrixMap.set(cur.id, info);
    }
    matrix.reset(info.m.toArray());
    workspace.value.notify(WorkSpace.MATRIX_TRANSFORMATION);
}
const stopWatch = watch(() => props.page, (cur, old) => {
    old.unwatch(page_watcher)
    cur.watch(page_watcher)
    let info = matrixMap.get(old.id);
    info!.m.reset(matrix.toArray())
    initMatrix(cur);
    const f = cur.style.fills[0];
    if (f) background_color.value = color2string(f.color);
})
watch(() => matrix, matrix_watcher, { deep: true });
onMounted(() => {
    props.context.selection.scoutMount(props.context);
    props.context.workspace.watch(workspace_watcher);
    props.context.workspace.init(t);
    props.context.workspace.setFreezeStatus(true);
    props.context.comment.watch(comment_watcher);
    props.context.menu.watch(menu_watcher);
    props.context.cursor.watch(cursor_watcher);
    props.context.cursor.init();
    props.context.tool.watch(tool_watcher);
    props.page.watch(page_watcher);
    props.context.assist.init();
    rootRegister(true);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', windowBlur);
    initpal().then(() => {
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
    props.context.tool.unwatch(tool_watcher);
    props.page.unwatch(page_watcher);
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
        <PageView :context="props.context" :data="(props.page as Page)" :matrix="matrix" />
        <TextSelection :context="props.context" :matrix="matrix"> </TextSelection>
        <UsersSelection :context="props.context" :matrix="matrix" v-if="avatarVisi" />
        <SelectionView :context="props.context" :matrix="matrix" />
        <ContextMenu v-if="contextMenu" :x="contextMenuPosition.x" :y="contextMenuPosition.y" @mousedown.stop
            :context="props.context" @close="contextMenuUnmount" :site="site" ref="contextMenuEl">
            <PageViewContextMenuItems :items="contextMenuItems" :layers="shapesContainsMousedownOnPageXY"
                :context="props.context" @close="contextMenuUnmount" :site="site">
            </PageViewContextMenuItems>
        </ContextMenu>
        <CellSetting v-if="cellSetting" :context="context" @close="closeModal" :addOrDivision="cellStatus"></CellSetting>
        <Placement v-if="contextMenu" :x="contextMenuPosition.x" :y="contextMenuPosition.y" :context="props.context">
        </Placement>
        <Selector v-if="selector_mount" :selector-frame="selectorFrame" :context="props.context"></Selector>
        <CommentView :context="props.context" :pageId="page.id" :page="page" :root="root" :cursorClass="cursor">
        </CommentView>
        <!-- <Overview :context="props.context" v-if="overview" :matrix="matrix.toArray()"></Overview> -->
        <Creator v-if="creatorMode" :context="props.context" />
    </div>
</template>