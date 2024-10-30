<script setup lang="ts">
import { getCurrentInstance, h, nextTick, onBeforeMount, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import PageViewVue from './Content/PageView.vue';
import SelectionView from './Selection/SelectionView.vue';
import ContextMenu from './Menu/ContextMenu.vue';
import Selector, { SelectorFrame } from './Selection/Selector.vue';
import { ArtboradView, Color, ImageScaleMode, Matrix, Page, PageView, ShapeType, ShapeView } from '@kcdesign/data';
import { Context } from '@/context';
import { ClientXY, ClientXYRaw, PageXY, XY } from '@/context/selection';
import { WorkSpace } from '@/context/workspace';
import { collect_once } from '@/utils/assist';
import { Menu } from '@/context/menu';
import { useI18n } from 'vue-i18n';
import { v4 } from "uuid";
import {
    adapt_page, color2string, drop, init_insert_table, root_scale, root_trans, selectShapes
} from '@/utils/content';
import { insertFrameTemplate } from '@/utils/artboardFn';
import TextSelection from './Selection/TextSelection.vue';
import { Cursor } from "@/context/cursor";
import { Action, Tool } from "@/context/tool";
import UsersSelection from './Selection/TeamWork/UsersSelection.vue';
import CellSetting from '@/components/Document/Menu/TableMenu/CellSetting.vue';
import Creator from './Creator/Creator.vue';
import { fourWayWheel, Wheel } from '@/utils/wheel';
import PathEditMode from "@/components/Document/Selection/Controller/PathEdit/PathEditMode.vue";
import { menu_locate } from '@/utils/common';
import { ColorCtx } from '@/context/color';
import Gradient from '@/components/Document/Selection/Controller/ColorEdit/Gradient.vue'
import { permIsEdit } from '@/utils/permission';
import Grid from "@/components/Document/Grid.vue";
import BatchExport from "./Cutout/BatchExport.vue";
import Rule from "./Rule/index.vue";
import { getArea, getMenuItems, MenuItemType, MountedAreaType } from "@/components/Document/Menu";
import TempBoard from "@/components/common/TempBoard.vue";
import Space from "@/components/Document/Space/index.vue";
import Placement from "@/components/Document/Menu/Placement.vue";
import ImageMode from '@/components/Document/Selection/Controller/ImageEdit/ImageMode.vue';
import { fontNameListEn, fontNameListZh, screenFontList, timeSlicingTask } from './Attribute/Text/FontNameList';
import { autoLayoutFn } from '@/utils/auto_layout';
import { Mouse } from "@/mouse";
import { MossClipboard } from "@/clipboard";

const emits = defineEmits<{
    (e: 'closeLoading'): void;
    (e: 'contentVisible'): void;
}>();
const props = defineProps<{
    context: Context;
    page: PageView;
}>();
type ContextMenuEl = InstanceType<typeof ContextMenu>;
const t = useI18n().t;
const workspace = props.context.workspace;
const spacePressed = ref<boolean>(false);
const contextMenu = ref<boolean>(false);
const contextMenuPosition: ClientXY = reactive({ x: 0, y: 0 });
const matrix = reactive(props.context.workspace.matrix);
const matrixMap = new Map<string, { m: Matrix, x: number, y: number }>();
const reflush = ref(0);
const root = ref<HTMLDivElement>();
const mousedownOnPageXY: PageXY = { x: 0, y: 0 };
const downXY: XY = { x: 0, y: 0 };
const mouseOnClient: ClientXYRaw = { x: 0, y: 0 };
const contextMenuEl = ref<ContextMenuEl>();
const selector_mount = ref<boolean>(false);
const selectorFrame = reactive<SelectorFrame>({ top: 0, left: 0, width: 0, height: 0, includes: false });
const cursor = ref<string>('');
const rootId = ref<string>('content');
const resizeObserver = new ResizeObserver(frame_watcher);
const background_color = ref<string>(color2string(Page.defaultBGColor));
const avatarVisi = ref(props.context.menu.isUserCursorVisible);
const cellSetting = ref(false);
const cellStatus = ref();
const creatorMode = ref<boolean>(false);
const path_edit_mode = ref<boolean>(false);
const color_edit_mode = ref<boolean>(false);
const image_tile_mode = ref<boolean>(false);
const isvisible = ref(false);
const visibleRect = reactive({ x: 0, y: 0, width: 0, height: 0 });
const mouse = new Mouse(props.context);
let shapesContainsMousedownOnPageXY: ShapeView[] = [];
let matrix_inverse: Matrix = new Matrix();
let firstTime = false;
let isDragging: boolean = false;
let wheel: Wheel | undefined = undefined;
let down: boolean = false;
let timer: any = null;

function _updateRoot(context: Context, element: HTMLElement) {
    const { x, y, right, bottom, width, height } = element.getBoundingClientRect();
    const root = {
        init: true, x, y, right, bottom, element,
        width: right - x,
        height: bottom - y,
        center: { x: (right - x) / 2, y: (bottom - y) / 2 }
    }
    context.workspace.updateRoot(root);
    visibleRect.x = 0;
    visibleRect.y = 0;
    visibleRect.width = width;
    visibleRect.height = height;
}

function page_watcher(...args: any) {
    if (args.includes('backgroundColor')) {
        const backgroundColor = props.page.backgroundColor;
        if (backgroundColor) {
            background_color.value = color2string(backgroundColor);
        }
    }
}

function rootRegister(mount: boolean) {
    if (mount) {
        const temp = v4().split('-');
        rootId.value = temp[temp.length - 1] || 'content';
    }
    workspace.setRootId(rootId.value);
}

function setMousedownXY(e: MouseEvent) { // 记录鼠标在页面上的点击位置
    const { clientX, clientY } = e;
    const { x, y } = workspace.root;
    const xy = matrix_inverse.computeCoord2(clientX - x, clientY - y);
    mousedownOnPageXY.x = xy.x;
    mousedownOnPageXY.y = xy.y;
    downXY.x = clientX;
    downXY.y = clientY;
}

function onMouseWheel(e: WheelEvent) { // 滚轮、触摸板事件
    if (contextMenu.value) return; //右键菜单已打开
    e.preventDefault();
    const { ctrlKey, metaKey } = e;
    if (ctrlKey || metaKey) { // 缩放
        root_scale(props.context, e);
    } else {
        root_trans(props.context, e);
    }

    workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
}

function onKeyDown(e: KeyboardEvent) {
    if (e.repeat || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || workspace.linearEditorExist) return;
    if (e.code === 'Space') {
        if (workspace.select || spacePressed.value) return;
        spacePressed.value = true;
    } else if (e.code === 'MetaLeft' || e.code === 'ControlLeft') {
        _search(true);
    }
}

function onKeyUp(e: KeyboardEvent) {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    if (spacePressed.value && e.code === 'Space') {
        spacePressed.value = false;
    } else if (e.code === 'MetaLeft' || e.code === 'ControlLeft') {
        _search(false);
    }
}

function insertFrame() {
    insertFrameTemplate(props.context);
}

function _search(auto: boolean) { // 支持阻止子元素冒泡的图形检索
    const { x, y } = workspace.root;
    const { x: mx, y: my } = mouseOnClient;
    const xy: PageXY = matrix_inverse.computeCoord2(mx - x, my - y);
    const shapes = props.context.selection.getShapesByXY(xy, auto);
    selectShapes(props.context, shapes);
}

function search(e: MouseEvent) { // 常规图形检索
    const ctx = props.context;
    if (ctx.workspace.transforming) return; // 编辑器编辑过程中不再判断其他未选择的shape的hover状态
    const { clientX, clientY, metaKey, ctrlKey } = e;
    const { x, y } = ctx.workspace.root;
    const xy = matrix_inverse.computeCoord2(clientX - x, clientY - y);

    if (ctx.user.isRuleVisible && !e.shiftKey) {
        if (ctx.tool.referFinder?.(xy)) {
            ctx.selection.unHoverShape();
            return;
        }
    }

    const shapes = ctx.selection.getShapesByXY(xy, metaKey || ctrlKey); // xy: PageXY
    selectShapes(ctx, shapes);
}

/**
 * @description 打开右键菜单
 */
const contextMenuItems = ref<Set<MenuItemType>>(new Set());

function contextMenuMount(e: MouseEvent) {
    const workspace = props.context.workspace;
    const selection = props.context.selection;
    const menu = props.context.menu;

    menu.menuMount();
    selection.unHoverShape();

    const root = workspace.root;
    contextMenuPosition.x = e.clientX - root.x;
    contextMenuPosition.y = e.clientY - root.y;
    setMousedownXY(e); // 更新鼠标定位

    contextMenuItems.value.clear();
    const area = getArea(props.context, e); // 判断点击环境

    contextMenuItems.value = getMenuItems(props.context, e, area); // 根据点击环境确定菜单选项
    const shapes = selection.getLayers(mousedownOnPageXY);

    if (shapes.length > 1 && (area !== MountedAreaType.TextSelection && area !== MountedAreaType.TableCell)) {
        shapesContainsMousedownOnPageXY = shapes;
        contextMenuItems.value.add(MenuItemType.Layers);
    }

    if (permIsEdit(props.context)) {
        const _shapes = selection.selectedShapes
        if (_shapes.length === 1 && _shapes[0].type === ShapeType.SymbolRef) {
            contextMenuItems.value.add(MenuItemType.EditComps);
        }
        if (area === MountedAreaType.TableCell) {
            const table = props.context.tableSelection;
            if (table.tableRowStart === table.tableRowEnd && table.tableColStart === table.tableColEnd) {
                contextMenuItems.value.add(MenuItemType.SplitCell);
                contextMenuItems.value.delete(MenuItemType.MergeCell);
            }
        }
        if (shapes.length) {
            contextMenuItems.value.add(MenuItemType.Mask);
        }
        if (_shapes.length) {
            const type = _shapes[0].type;
            if (_shapes.length === 1 && type !== ShapeType.Table) {
                contextMenuItems.value.add(MenuItemType.Flatten);
                contextMenuItems.value.add(MenuItemType.Outline);
            }
            if (_shapes.length === 1 && _shapes[0].mask) {
                contextMenuItems.value.delete(MenuItemType.Mask);
                contextMenuItems.value.add(MenuItemType.UnMask);
            }
            if (area !== MountedAreaType.Root) {
                if (_shapes.length > 1) {
                    contextMenuItems.value.add(MenuItemType.Flatten);
                    contextMenuItems.value.add(MenuItemType.Outline);
                    contextMenuItems.value.add(MenuItemType.AutoLayout);
                } else {
                    const shape = _shapes[0] as ArtboradView;
                    if (shape.autoLayout) {
                        contextMenuItems.value.add(MenuItemType.UnAutoLayout);
                    } else {
                        if ([ShapeType.Artboard, ShapeType.Symbol, ShapeType.SymbolUnion, ShapeType.SymbolRef].includes(shape.type)) {
                            contextMenuItems.value.add(MenuItemType.AutoLayout);
                        }
                    }
                }
            }
        }
    }

    contextMenu.value = true; // 数据准备就绪之后打开菜单
    menu.menuMount('content');
    // 打开菜单之后调整菜单位置
    nextTick(() => {
        if (!contextMenuEl.value) return;

        const el = contextMenuEl.value.menu;
        menu_locate(props.context, contextMenuPosition, el);

        props.context.escstack.save(v4(), contextMenuUnmount);
    })
}

/**
 * @description 关闭右键菜单
 */
function contextMenuUnmount() {
    props.context.menu.notify(Menu.HIDE_PLACEMENT);
    const exe_result = contextMenu.value;
    contextMenu.value = false;
    return exe_result;
}

function createSelector(e: MouseEvent) {
    const { clientX, clientY, altKey } = e;
    const { x: rx, y: ry } = workspace.root;
    const xy = matrix_inverse.computeCoord2(clientX - rx, clientY - ry);
    const { x: mx, y: my } = { x: xy.x, y: xy.y };
    const { x: sx, y: sy } = mousedownOnPageXY;
    const left = Math.min(sx, mx);
    const right = Math.max(mx, sx);
    const top = Math.min(my, sy);
    const bottom = Math.max(my, sy);
    const p = matrix_inverse.inverseCoord({ x: left, y: top })
    const s = matrix_inverse.inverseCoord({ x: right, y: bottom })
    selectorFrame.top = Math.min(p.y, s.y);
    selectorFrame.left = Math.min(p.x, s.x);
    selectorFrame.width = Math.max(p.x, s.x) - Math.min(p.x, s.x);
    selectorFrame.height = Math.max(p.y, s.y) - Math.min(p.y, s.y);
    selectorFrame.includes = altKey;
}

function updateMouse(e: MouseEvent) {
    mouse.event = e;
    mouseOnClient.x = e.clientX;
    mouseOnClient.y = e.clientY;
}

function onMouseDown(e: MouseEvent) {
    if (down) return;

    if (firstTime) {
        search(e);
        if (props.context.selection.hoveredShape) {
            props.context.selection.selectShape(props.context.selection.hoveredShape);
            e.stopPropagation();
        }
        firstTime = false;
    }

    if (workspace.linearEditorExist) return; // 当图形变换过程中不再接收新的鼠标点击事件

    if (e.button === 0) {
        down = true;
        setMousedownXY(e);
        props.context.tool.referSelection.resetSelected();
        document.addEventListener("mousemove", select);
        document.addEventListener("mouseup", up);
    } else if (e.button === 2) { // 右键按下，右键菜单处理
        e.stopPropagation();
        contextMenuMount(e);
    }
}

function select(e: MouseEvent) {
    if (workspace.controller === 'controller') return;
    if (isDragging && wheel) {
        if (wheel.is_inner(e)) {
            if (timer) {
                clearInterval(timer);
                timer = null;
                wheel.moving(e);
            }
            createSelector(e);
        } else {
            wheel.moving(e);
            clearInterval(timer);
            timer = setInterval(() => {
                createSelector(e);
            }, 30);
        }
    } else if (Math.hypot(downXY.x - e.clientX, downXY.y - e.clientY) > 4) {
        isDragging = true;
        selector_mount.value = true;
        props.context.workspace.selecting(true);
        props.context.cursor.cursor_freeze(true);
        wheel = fourWayWheel(props.context, undefined, mousedownOnPageXY);
    }
}

function move(e: MouseEvent) {
    updateMouse(e);
    if (!e.buttons) search(e);
}

function up(e: MouseEvent) {
    if (e.button) return;
    down = false;
    if (selector_mount.value) selectEnd();
    document.removeEventListener("mousemove", select);
    document.removeEventListener("mouseup", up);
}

function selectEnd() {
    if (!props.context.workspace.select) return;
    props.context.workspace.selecting(false);
    props.context.cursor.cursor_freeze(false);

    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    if (wheel) wheel = wheel.remove();

    isDragging = false;

    selectorFrame.top = 0;
    selectorFrame.left = 0;
    selectorFrame.width = 0;
    selectorFrame.height = 0;
    selector_mount.value = false;
}

function initMatrix(cur: PageView) {
    let info = matrixMap.get(cur.id);
    if (!info) {
        const m = new Matrix(adapt_page(props.context, true));
        info = { m, x: cur.frame.x, y: cur.frame.y };
        matrixMap.set(cur.id, info);
    }
    matrix.reset(info.m.toArray());
    workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
}

function windowBlur() {
    selectEnd();
    document.removeEventListener('mousemove', select);
    document.removeEventListener('mouseup', up);
}

const closeModal = () => {
    cellSetting.value = false
}

function updateBackground(page?: PageView) {
    const pageBackground = (page || props.page)?.backgroundColor;
    if (pageBackground) {
        background_color.value = color2string(pageBackground);
    }
}

function menu_watcher(type: number, mount?: string) {
    if (type === Menu.SHUTDOWN_MENU) contextMenuUnmount();
    if (type === Menu.CHANGE_USER_CURSOR) {
        avatarVisi.value = props.context.menu.isUserCursorVisible;
    } else if (type === Menu.OPEN_SPLIT_CELL) {
        cellStatus.value = mount;
        cellSetting.value = true;
    }
    if (type === Menu.EXPORT_DIALOG) {
        isvisible.value = props.context.menu.isExportDialog;
        props.context.escstack.save(v4(), export_dialog_show);
    } else if (type === Menu.AUTO_LAYOUT) {
        autoLayoutFn(props.context, t);
    }
}

const export_dialog_show = () => {
    const is_achieve_expected_results = isvisible.value;
    isvisible.value = false;
    return is_achieve_expected_results;
}

function isCreatorSupportAction(action: string | undefined) {
    return action && Object.values(Action).indexOf(action) >= 0 && action.startsWith('add') || false
}

function tool_watcher(type: number) {
    if (type === Tool.CHANGE_ACTION) {
        if (props.context.workspace.is_path_edit_mode) return;
        creatorMode.value = isCreatorSupportAction(props.context.curAction);
    } else if (type === Tool.INSERT_FRAME) {
        insertFrame();
    } else if (type === Tool.INSERT_TABLE) {
        init_insert_table(props.context, t);
    }
}

function workspace_watcher(type?: number | string, param?: string | MouseEvent | Color) {
    if (type === WorkSpace.MATRIX_TRANSFORMATION) {
        matrix.reset(workspace.matrix);
        matrix_inverse = new Matrix(matrix.inverse);
        collect_once(props.context, matrix as Matrix);
    } else if (type === WorkSpace.PASTE_RIGHT) {
        props.context.workspace.clipboard.paste(t, undefined, mousedownOnPageXY);
    } else if ((type === WorkSpace.ONARBOARD__TITLE_MENU) && param) {
        contextMenuMount((param as MouseEvent));
    } else if (type === WorkSpace.PATH_EDIT_MODE) {
        path_edit_mode.value = props.context.workspace.is_path_edit_mode;
        if (props.context.tool.action !== Action.AddContact) {
            creatorMode.value = false;
        }
    } else if (type === WorkSpace.LOCAL_FONT_LIST_UPDATE) {
        screenFontList(props.context);
    }
}

function frame_watcher() {
    if (!root.value) return;
    _updateRoot(props.context, root.value);
}
function cursor_watcher(t: number, type: string) {
    if (t === Cursor.CHANGE_CURSOR && type) {
        cursor.value = type;
    }
}

function copy_watcher(event: ClipboardEvent) {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
    props.context.workspace.clipboard.write(event);
}

function cut_watcher(event: ClipboardEvent) {
    if (!permIsEdit(props.context) || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
    props.context.workspace.clipboard.cut(event);
}

function paster_watcher(event: ClipboardEvent) {
    if (!permIsEdit(props.context) || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
    {
        const clip = new MossClipboard(props.context);
        clip.read(event).then(bundle => {
            console.log('--bundle--', bundle);
        })
      clip.getUint8ByBase64("data:image/jpeg;base64,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ooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAPwzS/gaSjNFwsf//R+hPeiiiv8+z+vAooooAPeiiigAooooAPeiiigAooooAPeiiigAooooAPeiiigAooooAPeiiigAooooAPeiiigAooooAPeiiigAooooAPeiiigAooooAPeiiigAooooAPeiiigAooooAPeiiigAooooAPeiiigAooooAPeiiigAooooAPeiiigAooooAPeiiigAooooAPeiiigAooooAPeiiigAooooAPeiiigA57UvPpScdxS/L6UAf/0voSiiiv8+z+vAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigA/DNL+BpKM0XCx//9P6E96KKK/z7P68CiiigA96KKKACiiigA96KKKACiiigA96KKKACiiigA96KKKACiiigA96KKKACiiigA96KKKACiiigA96KKKACiiigA96KKKACiiigA96KKKACiiigA96KKKACiiigA96KKKACiiigA96KKKACiiigA96KKKACiiigA96KKKACiiigA96KKKACiiigA96KKKACiiigA96KKKACiiigA96KKKADntS8+lJx3FL8vpQB//U+hKKKK/z7P68CiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAD8M0v4GkozRcLH//1foT3ooor/Ps/rwKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAOe1Lz6UnHcUvy+lAH/9b6Eooor/Ps/rwKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAPwzS/gaSjNFwsf//X+hPeiiiv8+z+vAooooAPeiiigAooooAPeiiigAooooAPeiiigAooooAPeiiigAooooAPeiiigAooooAPeiiigAooooAPeiiigAooooAPeiiigArz7x38UfBPw5t1l8UagIZpVLRW8YMk8gHog6D/AGmIX3rL+MfxJg+GHgyfW1Cy6hOwgs4m6PMwzkgc7UALH14GRkV+TWq6rq/iXV5tV1WeS+1C9k3O7fM7sx4AH6ADgDgCv1Pw/wDDl5qnisTJxop203k+tuyXV/L0+D4v4yWAaoUVeo++y/4Pkfber/tmWiSlNB8MvLH2e5uBGx/4AiOP/HqxLf8AbN1dWzdeF4JFz0S5ZDj6lG/lWH4G/ZJ8Ta7ZRal4u1BdDSUBlt1j864wf7/Kqh9ssR3ANdzqn7GdibZjoviWRbgDgXFuGRj6EowK/XB+lfa1aXBFCf1edm1o3eo1960+7Q+Zp1OKKsfbR0Xb3F+D1+89F8GftT/DvxNcJY6wJfD9zJgA3OGgJPbzV+79XVR719Ko6SoskbB0cAgg5BB5BB9K/Gjx38PvE/w51k6L4mtvKdgWilQ7oZkH8UbYGR6ggEdwK+jv2Y/jHe6VrFv8OfENwZdNv22WLyNkwTH7sYJ/gc8Admxjqa8zi7wvw31R5jk8+aKV3G9013i/Ls7/AH6Hdw9xzX+sLB5lG0r2va2vZrz7r/gn6Ge9FFFfhR+qBRRRQAe9FFFABRRRQAe9FFFABRRRQAe9FFFABRRRQAe9FFFABRRRQAe9FFFABRRRQAe9FFFABRRRQAe9FFFABRRRQAe9FFFABz2pefSk47il+X0oA//Q+hKKKK/z7P68CiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD86v2wdflvPG2leHVfNvptn5xX0luHO7/x1Ex9axv2UPB1p4i8fz67fxiWHQIRNGpGR9okbbGxB/ugMw9GAPav0B1zwD4I8TXDXfiDQbG/uGAUzTW6NKQOAN5G7A7c03wt4B8HeCpLubwrpcWmtfbBN5W7D+Xu28EkDG49Mda/XqfiPQpZD/ZVCnKM+XlvpbV+956pvofnc+DKs82+v1Zpxve2t9Fp5aaHX0UUV+Qn6IeG/tE+E7HxR8LdWmnjButHjN7byY5QxcuAfRkyCOmcHsK/Kmzu7iwu4L60cxz27rJGw6h0IKn8CK/Uj9pXxhbeGPhhf2BcC81zFnCncq3MrY9AmRn1I9a/L3TdPutX1G00qyTfcXsqQxL6vIwVR+JNf1D4NKospqOt8HM7X7WV/lf8AG5+F+JLg8wgqfx8qvbvd2+f/AAD9tdNuxqGnWt+o4uYklGOnzqD/AFq7VWxtUsbK3so/u28aRj6IAB/KrVfzDUceZ8ux+5QvZc24UUUVBQUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAfhml/A0lGaLhY//9H6E96KKK/z7P68CiiigA96KKKACiiigA96KKKACiiigA96KKKACiiigA96KKKACiiigA96KKKACiiigA96KKKACiiigA96KKKACiiigA96KKKACiiigA96wfE3iXRfCGiXPiDxBcra2Vou5mPUnsqjqzMeAByTVDxr448OeANEl17xLciCBOEQcyTP2SNf4mP5DqSBk1+W3xY+L3iD4qav9ovSbXS7Zj9ls1OUjHTc5/ikI6t26DAr7/gfgPEZvV55e7RW8u/lHu/wXXs/kuKOLKOXU+Va1Hsv1fl+f4lP4sfEzU/ij4pk1u7UwWcIMVnb5yIoc55xwXbqx9eOgFe5/sr/AArn1jWx8RNYgxp2mllsww/1tz03gd1i55/v4xyprzn4KfBDVfifqK6hfh7Pw7bPiafGGmI6xQ56n+83RfrgH9RtK0rTtD0220jSYFtbO0QRxRoMKqqOB/j3PU1+n+InF2Gy7B/2Ll1lK3K7fZj2/wAT6/NvVnw3B3D1bGYj+08bte6v9p9/Rf1oX/eiiiv5xP2YKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAOe1Lz6UnHcUvy+lAH//S+hKKKK/z7P68CiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAry34p/Fjw78LNG+3am32i/uARa2aHEkzDueu1B3Yj6ZOBWp8SviBpXw18KXPiTU8O6/Jbw5w087D5UHtxlj2UE+1fkj4s8Wa5421258ReIbg3F3cnnsqKPuog/hVegH8zk1+oeHXADzWp9YxGlGL+cn2Xl3fyWuq+F4y4uWAh7GjrVf4Lu/Psv6ej478f+JfiLrb654kuPNfkRRLkRQIf4I17D1PU9SSa9s+CH7PGoePHh8TeLEksvDwIZE5WW89k7rH6v1PRf7w7j4Cfs5JqMdr43+IMGbVwstpYOP9aOqyTD+6eqp/F1bjg/eqosahI1CqowABgADsK+3438SKWCh/ZmT2XLo5LaPlHz7vp012+Y4X4LqYmX17Mru+qT3fm/Ly6+m9TTtNsNHsINL0u3S1tLZAkUUY2oijoABV2iiv56lNyblJ3bP2CMUlZBRRRUjCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigA/DNL+BpKM0XCx/9P6E96KKK/z7P68CiiigA96KKKACiiigA96KKKACiiigA96KKKACiiigA96KKKACiiigA96KKKACiiigA96KKKACiiigA96KKKACiiigA96KKKAPy//AGnvHM3ir4iTaHC5+weHs2yL2M5wZm+u7CfRa8B0bUho+q2uqG0gvvssiyCG5VmhcryA6qykjPbPPQ5GQfu/xF+yIdf8QanrzeLfJOpXU1yU+wbtvnOX27vPGcZ64GfQVjf8MW/9Tj/5T/8A7or+qcj484ewmApYNV7KMUn7s97a7R6u7PwXNOE84xGLniXS1buvej8uvY4Iftf/ABNA407Scf8AXCf/AOP0f8NgfE3/AKB2k/8Afif/AOP13v8Awxb/ANTj/wCU7/7oo/4Yt/6nH/ynf/dFeT/anBHaP/gE/wD5E9D6jxR3l/4FH/M4L/hsD4nf9A7Sf+/E/wD8fo/4bA+Jv/QP0n/vxP8A/H673/hi3/qcf/Kf/wDdFH/DFv8A1OP/AJT/AP7oo/tTgjtH/wAAn/8AIh9R4o7y/wDAo/5n2j4fv5tW0HTdVuFVZby2hmcLwoaRAxAyScZPHNa9Zujad/ZGj2OkiTzfsUEUG/G3d5ahc4ycZxnGa0q/nLEOLqScNru3ofs1FS5Fzb2CiiisTQPeiiigAooooAPeiiigAooooAPeiiigAooooAPeiiigAooooAPeiiigAooooAPeiiigAooooAPeiiigAooooAPeiiigA57UvPpScdxS/L6UAf/U+hKKKK/z7P68CiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAD8M0v4GkozRcLH//1foT3ooor/Ps/rwKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAOe1Lz6UnHcUvy+lAH/9b6Eooor/Ps/rwKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAPwzS/gaSjNFwsf//X+hPeiiiv8+z+vAooooAPeiiigAooooAPeiiigAooooAPeiiigAooooAPeiiigAooooAPeiiigAooooAPeiiigAooooAPeiiigAooooAPeiiigAooooAPeiiigAooooAPeiiigAooooAPeiiigAooooAPeiiigAooooAPeiiigAooooAPeiiigAooooAPeiiigAooooAPeiiigAooooAPeiiigAooooAPeiiigA57UvPpScdxS/L6UAf/0PoSiiiv8+z+vAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigA/DNL+BpKM0XCx//9H6E96KKK/z7P68CiiigA96KKKACiiigA96KKKACiiigA96KKKACiiigA96KKKACiiigA96KKKACiiigA96KKKACiiigA96KKKACiiigA96KKKACiiigA96KKKACiiigA96KKKACiiigA96KKKACiiigA96KKKACiiigA96KKKACiiigA96KKKACiiigA96KKKACiiigA96KKKACiiigA96KKKACiiigA96KKKADntS8+lJx3FL8vpQB//S+hKKKK/z7P68CiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAD8M0v4GkozRcLH//0/oT3ooor/Ps/rwKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAKKKKAD3ooooAOe1Lz6UnHcUvy+lAH/9k=")
    }
    return props.context.workspace.clipboard.paste(t, event);
}

function color_watcher(t: number) {
    if (t === ColorCtx.COLOR_EDITOR) {
        color_edit_mode.value = false;
        const mode = props.context.color.mode;
        const gradient = props.context.color.gradient;
        const selected = props.context.selection.selectedShapes;
        color_edit_mode.value = mode && !!gradient && selected.length === 1;
    } else if (t === ColorCtx.CHANGE_IMAGE_MODE) {
        image_tile_mode.value = false;
        const selected = props.context.selection.selectedShapes;
        const mode = props.context.color.imageScaleMode;
        image_tile_mode.value = (mode === ImageScaleMode.Tile || mode === ImageScaleMode.Crop) && selected.length === 1;
    }
}

function windowFocus() {
    firstTime = true;
}

const onRenderDone = () => {
    emits('closeLoading');
    resizeObserver.observe(root.value!);
    _updateRoot(props.context, root.value!);
    initMatrix(props.page);
}
const onContentVisible = () => {
    emits('contentVisible');
}

const comps: { component: any, params?: any }[] = [];

const plugins = props.context.pluginsMgr.search2("content");
comps.push(...plugins.begin);

comps.push(
    // 页面
    {
        component: PageViewVue, params: {
            get data() {
                return props.page
            },
            get matrix() {
                return matrix
            },
            get visibleRect() {
                return visibleRect;
            },
            onRenderDone,
            onContentVisible
        }
    },
    // 筛选结果文本高亮
    {
        component: TextSelection, params: {
            get matrix() {
                return matrix
            }
        }
    },
    // 协作用户选区
    {
        component: UsersSelection, params: {
            get matrix() {
                return matrix
            },
            get visible() {
                return avatarVisi.value
            }
        }
    },
    // 本地选区
    {
        component: SelectionView, params: {
            get matrix() {
                return matrix
            },
        }
    },
    // 菜单
    {
        component: () => {
            if (contextMenu.value) {
                return h(ContextMenu, {
                    ref: contextMenuEl,

                    context: props.context,
                    items: contextMenuItems.value,
                    layers: shapesContainsMousedownOnPageXY,
                    onClose: contextMenuUnmount
                });
            }
        }
    },
    // 表格菜单
    {
        component: CellSetting, params: {
            get visible() {
                return cellSetting.value
            },
            close: closeModal,
            get cellStatus() {
                return cellStatus.value
            }
        }
    },
    // 图层框选器
    {
        component: Selector, params: {
            get visible() {
                return selector_mount.value
            },
            get frame() {
                return selectorFrame
            }
        }
    },
    // 图层创建器
    {
        component: Creator, params: {
            get visible() {
                return creatorMode.value
            },
        }
    },
    // 路径编辑界面
    {
        component: PathEditMode, params: {
            get visible() {
                return path_edit_mode.value
            },
        }
    },
    // 渐变色编辑界面
    {
        component: Gradient, params: {
            get visible() {
                return color_edit_mode.value
            },
            get matrix() {
                return matrix
            },
        }
    },
    // 像素网格
    {
        component: Grid
    },
    {
        component: TempBoard
    },
    {
        component: Placement,
        params: {
            get site() {
                return contextMenuPosition
            }
        }
    },
    // 图层导出载体
    {
        component: () => {
            if (isvisible.value) {
                return h(BatchExport, {
                    context: props.context
                });
            }
        }
    }
)

comps.push(...plugins.end);

const stop1 = watch(() => props.page, (cur, old) => {
    old.unwatch(page_watcher)
    cur.watch(page_watcher)
    let info = matrixMap.get(old.id);
    info!.m.reset(matrix.toArray())
    updateBackground(cur);
})

onBeforeMount(props.context.user.updateUserConfig.bind(props.context.user));

onMounted(() => {
    props.context.selection.scoutMount(props.context);
    props.context.workspace.watch(workspace_watcher);
    props.context.workspace.init(t.bind(getCurrentInstance()));
    props.context.menu.watch(menu_watcher);
    props.context.cursor.watch(cursor_watcher);
    props.context.cursor.init();
    props.context.tool.watch(tool_watcher);
    props.page.watch(page_watcher);
    props.context.color.watch(color_watcher);
    props.context.user.updateUserConfig();
    rootRegister(true);
    updateBackground();
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('copy', copy_watcher);
    document.addEventListener('cut', cut_watcher);
    document.addEventListener('paste', paster_watcher);
    window.addEventListener('blur', windowBlur);
    window.addEventListener('focus', windowFocus);

    const f = props.page.data.backgroundColor;
    if (f) background_color.value = color2string(f);
    timeSlicingTask(props.context, fontNameListZh, 'zh');
    timeSlicingTask(props.context, fontNameListEn, 'en');

    nextTick(() => {
        // resizeObserver.observe(root.value!);
        // _updateRoot(props.context, root.value!);
    });
})
onUnmounted(() => {
    props.context.selection.scout?.remove();
    props.context.workspace.unwatch(workspace_watcher);
    props.context.menu.unwatch(menu_watcher);
    props.context.cursor.remove();
    props.context.cursor.unwatch(cursor_watcher);
    props.context.tool.unwatch(tool_watcher);
    props.page.unwatch(page_watcher);
    props.context.color.unwatch(color_watcher);
    resizeObserver.disconnect();
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);
    document.removeEventListener('copy', copy_watcher);
    document.removeEventListener('cut', cut_watcher);
    document.removeEventListener('paste', paster_watcher);
    window.removeEventListener('blur', windowBlur);
    window.removeEventListener('focus', windowFocus);
    stop1();
    clearInterval(timer);
    mouse.destroy();
})
</script>
<template>
    <div ref="root" :class="cursor" :data-area="rootId" :reflush="reflush !== 0 ? reflush : undefined"
         :style="{ 'background-color': background_color }" @wheel="onMouseWheel" @mousedown="onMouseDown"
         @mousemove="move" @mouseleave="props.context.selection.unHoverShape"
         @drop.prevent="(e: DragEvent) => { drop(e, props.context) }" @dragover.prevent>
        <component v-for="c in comps" :is=c.component :context="props.context" :params="c.params" />
        <ImageMode v-if="image_tile_mode" :context="props.context" :matrix="matrix as Matrix"/>
        <Rule :context="props.context" :page="(props.page as PageView)" />
        <!-- 页面调整控件，确保在ContentView顶层 -->
        <Space :context="props.context" :visible="spacePressed" />
    </div>
</template>