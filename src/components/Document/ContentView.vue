/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { getCurrentInstance, h, nextTick, onBeforeMount, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import PageViewVue from './Content/PageView.vue';
import SelectionView from './Selection/SelectionView.vue';
import ContextMenu from './Menu/ContextMenu.vue';
import Selector, { SelectorFrame } from './Selection/Selector.vue';
import { ArtboardView, Color, ImageScaleMode, Matrix, Page, PageView, ShapeType, ShapeView } from '@kcaitech/vextra-core';
import { Context } from '@/context';
import { ClientXY, ClientXYRaw, PageXY, XY } from '@/context/selection';
import { WorkSpace } from '@/context/workspace';
import { collect_once } from '@/utils/assist';
import { Menu } from '@/context/menu';
import { useI18n } from 'vue-i18n';
import { v4 } from "uuid";
import {
    fitView, color2string, drop, root_scale, root_trans, selectShapes
} from '@/utils/content';
import { insertFrameTemplate } from '@/utils/artboardFn';
import TextSelection from './Selection/TextSelection.vue';
import { Cursor } from "@/context/cursor";
import { Action, Tool } from "@/context/tool";
import UsersSelection from './Selection/TeamWork/UsersSelection.vue';
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
import { screenFontList } from './Attribute/Text/FontNameList';
import { autoLayoutFn } from '@/utils/auto_layout';
import { Mouse } from "@/mouse";
import ImagePicker from "@/imageLoader/ImagePicker.vue";
import { SpaceHandler } from "@/space";
import { KeyboardMgr } from '@/keyboard';

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
const avatarVisible = ref(props.context.menu.isUserCursorVisible);
const cellSetting = ref(false);
const cellStatus = ref();
const creatorMode = ref<boolean>(false);
const path_edit_mode = ref<boolean>(false);
const color_edit_mode = ref<boolean>(false);
const image_tile_mode = ref<boolean>(false);
const isExportPanelVisible = ref(false);
const visibleRect = reactive({ x: 0, y: 0, width: 0, height: 0 });
const mouse = new Mouse(props.context);
let shapesContainsMousedownOnPageXY: ShapeView[] = [];
let matrix_inverse: Matrix = new Matrix();
let firstTime = false;
let isDragging: boolean = false;
let wheel: Wheel | undefined = undefined;
let down: boolean = false;
let timer: any = null;
let zoomIn = false;

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
    if (e.repeat || workspace.linearEditorExist) return;
    if (e.code === 'Space') {
        if (workspace.select || spacePressed.value) return;
        spacePressed.value = true;
    } else if (e.code === 'MetaLeft' || e.code === 'ControlLeft') {
        _search(true);
    }
}

function onKeyUp(e: KeyboardEvent) {
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

    const shapes = ctx.selection.getShapesByXY(xy, metaKey || ctrlKey);
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
        if (_shapes.length) {
            const type = _shapes[0].type;
            if (_shapes.length === 1 && type !== ShapeType.Table && area !== MountedAreaType.Root) {
                if (type !== ShapeType.Cutout) {
                    contextMenuItems.value.add(MenuItemType.Flatten);
                    contextMenuItems.value.add(MenuItemType.Outline);
                    contextMenuItems.value.add(MenuItemType.Mask);
                }
            }
            if (_shapes.length === 1 && _shapes[0].mask) {
                contextMenuItems.value.delete(MenuItemType.Mask);
                contextMenuItems.value.add(MenuItemType.UnMask);
            }
            if (area !== MountedAreaType.Root) {
                if (_shapes.length > 1 && _shapes.some(i => i.type !== ShapeType.Cutout)) {
                    contextMenuItems.value.add(MenuItemType.Flatten);
                    contextMenuItems.value.add(MenuItemType.Outline);
                    contextMenuItems.value.add(MenuItemType.Mask);
                    contextMenuItems.value.add(MenuItemType.AutoLayout);
                } else {
                    const shape = _shapes[0] as ArtboardView;
                    if (shape.autoLayout) {
                        contextMenuItems.value.add(MenuItemType.UnAutoLayout);
                    } else {
                        contextMenuItems.value.add(MenuItemType.AutoLayout);
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
        props.context.tool.referSelection?.resetSelected();
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
        zoomIn = props.context.selection.zoomIn;
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

    if (zoomIn ?? props.context.selection.zoomIn) new SpaceHandler(props.context).zoomIn(selectorFrame.left, selectorFrame.top, selectorFrame.width, selectorFrame.height);

    selectorFrame.top = 0;
    selectorFrame.left = 0;
    selectorFrame.width = 0;
    selectorFrame.height = 0;
    selector_mount.value = false;
}

function initMatrix(cur: PageView) {
    let info = matrixMap.get(cur.id);
    if (!info) {
        const m = new Matrix(fitView(props.context, true));
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
        avatarVisible.value = props.context.menu.isUserCursorVisible;
    } else if (type === Menu.OPEN_SPLIT_CELL) {
        cellStatus.value = mount;
        cellSetting.value = true;
    }
    if (type === Menu.EXPORT_DIALOG) {
        isExportPanelVisible.value = props.context.menu.isExportDialog;
        props.context.escstack.save(v4(), export_dialog_show);
    } else if (type === Menu.AUTO_LAYOUT) {
        autoLayoutFn(props.context, t);
    }
}

const export_dialog_show = () => {
    const is_achieve_expected_results = isExportPanelVisible.value;
    isExportPanelVisible.value = false;
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
    props.context.clip.write(event);
}

function cut_watcher(event: ClipboardEvent) {
    if (!permIsEdit(props.context) || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
    props.context.clip.cut(event);
}

function paster_watcher(event: ClipboardEvent) {
    if (!permIsEdit(props.context) || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
    props.context.clip.paste(event);
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

const renderDone = ref<boolean>(false);
const onRenderDone = () => {
    emits('closeLoading');
    initMatrix(props.page);
    renderDone.value = true;
}
const onContentVisible = () => {
    emits('contentVisible');
}

const comps: { component: any, params?: any }[] = [];

const plugins = props.context.pluginsMgr.search2("content");
comps.push(...plugins.begin);
comps.push(
    // {
    //     component: VextCanvas,
    //     params: {
    //         get data() {
    //             return props.page
    //         },
    //         get matrix() {
    //             return matrix
    //         },
    //         get visibleRect() {
    //             return visibleRect;
    //         },
    //         onRenderDone,
    //         onContentVisible
    //     }
    // },
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
                return avatarVisible.value
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
            if (isExportPanelVisible.value) {
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
    const info = matrixMap.get(old.id); // 可能为undefined。matrixMap在renderDone时才给对应的page添加了Matrix信息
    if (info) info.m.reset(matrix.toArray())
    updateBackground(cur);
});
const boardMgr = new KeyboardMgr(props.context);
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
    screenFontList(props.context);
    boardMgr.addEventListener('keydown', onKeyDown);
    boardMgr.addEventListener('keyup', onKeyUp);
    document.addEventListener('copy', copy_watcher);
    document.addEventListener('cut', cut_watcher);
    document.addEventListener('paste', paster_watcher);
    window.addEventListener('blur', windowBlur);
    window.addEventListener('focus', windowFocus);

    const f = props.page.data.backgroundColor;
    if (f) background_color.value = color2string(f);

    resizeObserver.observe(root.value!);
    _updateRoot(props.context, root.value!);

    onRenderDone();
    onContentVisible();
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
    boardMgr.removeEventListener('keydown', onKeyDown);
    boardMgr.removeEventListener('keyup', onKeyUp);
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
    <div ref="root" id="content" :class="cursor" :data-area="rootId" :reflush="reflush !== 0 ? reflush : undefined"
        :style="{ 'background-color': background_color }" @wheel="onMouseWheel" @mousedown="onMouseDown"
        @mousemove="move" @mouseleave="props.context.selection.unHoverShape"
        @drop.prevent="(e: DragEvent) => { drop(e, props.context) }" @dragover.prevent>
        <component v-for="c in comps" :is=c.component :context="props.context" :params="c.params" />
        <ImageMode v-if="image_tile_mode" :context="props.context" :matrix="matrix as Matrix" />
        <Rule :context="props.context" :page="(props.page as PageView)" />
        <ImagePicker :context="props.context" />
        <!-- 页面调整控件，确保在ContentView顶层 -->
        <Space :context="props.context" :visible="spacePressed" />
    </div>
</template>
<style lang="scss" scoped>
#content {
    height: 100%;
    width: 100%;
    overflow: hidden;
    position: relative;
}
</style>