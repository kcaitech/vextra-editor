/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { Context } from '@/context';
import { Menu } from '@/context/menu';
import { nextTick, onMounted, onUnmounted, ref, h, watchEffect } from 'vue';
import Key from "@/components/common/Key.vue";
import { MenuItemType } from "@/components/Document/Menu/index";
import { useI18n } from "vue-i18n";
import {
    adapt_page, flattenSelection,
    get_shape_within_document,
    lower_layer, outlineSelection,
    select_all,
    shape_track,
    upper_layer
} from "@/utils/content";
import { WorkSpace } from "@/context/workspace";
import { message } from "@/utils/message";
import { string_by_sys } from "@/utils/common";
import {
    ArtboardView,
    ShapeType,
    ShapeView,
    SymbolRefView,
    TableCellType,
    TableCellView,
    TextShapeView
} from "@kcdesign/data";
import { Tool } from "@/context/tool";
import { make_symbol } from "@/utils/symbol";
import { Navi } from "@/context/navigate";
import Layers from './Layers.vue';
import TableMenu from './TableMenu/TableMenu.vue';
import { useMask } from "@/components/Document/Creator/execute";
import { autoLayoutFn, unAutoLayoutFn } from '@/utils/auto_layout';
import { MossClipboard } from "@/clipboard";

interface Props {
    context: Context;
    items: Set<MenuItemType>;
    layers?: ShapeView[],
    width?: number;
}

interface Emits {
    (e: 'close'): void
}

const menu = ref<HTMLDivElement>();
const props = defineProps<Props>();
const emits = defineEmits<Emits>();
const { t } = useI18n();

defineExpose({ menu });
const showLayer = ref<MenuItemType>();
const layersMenu = ref<HTMLDivElement>();
const cursor = ref<boolean>(props.context.menu.isUserCursorVisible);
const cutout = ref<boolean>(props.context.tool.isCutoutVisible);
const title = ref<boolean>(props.context.tool.isShowTitle);
const layersHeight = ref();

function handleClickOutside(event: MouseEvent) {
    event.stopPropagation()

    if (event.target instanceof Element && !event.target.closest('.__context-menu')) {
        props.context.menu.menuMount();
    }
}

function menu_watcher(type: number) {
    if (type === Menu.SHUTDOWN_MENU) {
        emits('close');
    }
}

function showLayerSubMenu(e: MouseEvent, type: MenuItemType) {
    showLayer.value = type;
    nextTick(() => {
        if (!layersMenu.value) return;
        const el = layersMenu.value;
        layersHeight.value = menu.value?.getBoundingClientRect().height;
        if (el) {
            const target = (e.target as HTMLElement);
            const rect = target.getBoundingClientRect();
            const root = props.context.workspace.root;
            el.style.right = (root.right - (rect.right + 4)) >= rect.width ? -rect.width + 'px' : rect.width + 'px';
        }
    })
}

function closeLayerSubMenu() {
    showLayer.value = undefined;
}

function is_inner_textshape(): TextShapeView | TableCellView | undefined {
    const selected = props.context.selection.selectedShapes;
    const isEditing = props.context.workspace.isEditing;
    if (selected.length === 1 && selected[0].type === ShapeType.Text && (selected[0] as TextShapeView).text && isEditing) {
        return selected[0] as TextShapeView;
    }
    if (selected.length === 1 && selected[0].type === ShapeType.Table) {
        const tableSelection = props.context.tableSelection;
        if (tableSelection.editingCell && tableSelection.editingCell && tableSelection.editingCell.cellType === TableCellType.Text) {
            return tableSelection.editingCell;
        }
    }
}

function all() {
    select_all(props.context);
    emits('close');
}

function copy() {
    if (!navigator.clipboard?.read) {
        message('info', string_by_sys(t('clipboard.not_supported1')));
        return;
    }
    const textlike = is_inner_textshape();
    if (textlike) {
        const selection = props.context.textSelection;
        const start = selection.cursorStart;
        const end = selection.cursorEnd;
        const s = Math.min(start, end);
        if (s === end) {
            return emits('close');
        }
        props.context.workspace.clipboard.write();
    } else {
        props.context.workspace.clipboard.write();
    }
    emits('close');
}

function cut() {
    if (!navigator.clipboard?.read) {
        message('info', string_by_sys(t('clipboard.not_supported2')));
        return;
    }
    const textlike = is_inner_textshape();
    if (textlike) {
        const selection = props.context.textSelection;
        const start = selection.cursorStart;
        const end = selection.cursorEnd;
        if (start === end) {
            return emits('close');
        }

        const copy_result = props.context.workspace.clipboard.write();

        if (copy_result) {
            const editor = props.context.editor4TextShape(textlike);
            if (editor.deleteText(Math.min(start, end), Math.abs(start - end))) {
                selection.setCursor(Math.min(start, end), false);
            }
        }
    }
    emits('close');
}

function paste() {
    const textlike = is_inner_textshape();
    if (textlike) {
        props.context.workspace.clipboard.paste_text();
    } else {
        props.context.workspace.clipboard.paste(t);
    }
    emits('close');
}

function paste_text() {
    const textlike = is_inner_textshape();
    if (textlike) {
        props.context.workspace.clipboard.paste_for_no_format_text();
    }
    emits('close');
}

function pasteHere() {
    props.context.workspace.notify(WorkSpace.PASTE_RIGHT);
    emits('close');
}

function _replace() {
    // props.context.workspace.clipboard.replace();
    new MossClipboard(props.context).replace();
    emits('close');
}

function page_scale(e: MouseEvent, scale: number) {
    const workspace = props.context.workspace;
    const root = workspace.root;
    const matrix = workspace.matrix;
    const offsetX = e.x - root.x;
    const offsetY = e.y - root.y;
    matrix.trans(-offsetX, -offsetY);
    matrix.scale(scale / matrix.m00);
    matrix.trans(offsetX, offsetY);
    workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
}

function half(e: MouseEvent) {
    e.preventDefault();
    page_scale(e, 0.5);
    emits('close');
}

function hundred(e: MouseEvent) {
    e.preventDefault();
    page_scale(e, 1);
    emits('close');
}

function canvas() {
    adapt_page(props.context);
    emits('close');
}

function double(e: MouseEvent) {
    e.preventDefault();
    page_scale(e, 2);
    emits('close');
}

function _cursor() {
    const status = props.context.menu.isUserCursorVisible;
    cursor.value = !status;
    props.context.menu.setVisibleCursor(cursor.value);
    emits('close');
}

function _cutout() {
    const status = props.context.tool.isCutoutVisible;
    cutout.value = !status;
    props.context.tool.setCutoutVisible(cutout.value);
    emits('close');
}

function ruler() {
}

function pixel() {
}

function operation() {
    props.context.layout.all();
    emits('close');
}

function forward() {
    const selection = props.context.selection;
    const page = selection.selectedPage;
    if (page) {
        const result = upper_layer(props.context, 1);
        if (result) {
            emits('close');
        }
    }
}

function back() {
    const selection = props.context.selection;
    const page = selection.selectedPage;
    if (page) {
        const result = lower_layer(props.context, 1);
        if (result) {
            emits('close');
        }
    }
}

function top() {
    const selection = props.context.selection;
    const page = selection.selectedPage;
    if (page) {
        const result = upper_layer(props.context);
        if (result) {
            emits('close');
        }
    }
}

function bottom() {
    const selection = props.context.selection;
    const page = selection.selectedPage;
    if (page) {
        const result = lower_layer(props.context);
        if (result) {
            emits('close');
        }
    }
}

function groups() {
    const name = props.context.workspace.t('shape.group');
    const views = props.context.selection.selectedShapes;
    group(props.context, views, name);
    emits('close');
}

function container() {
    const name = props.context.workspace.t('shape.artboard');
    const views = props.context.selection.selectedShapes;
    group(props.context, views, name, true);
    emits('close');
}

function dissolution_container() {
    const selection = props.context.selection;
    const artboards = selection.selectedShapes.filter(s => s.type === ShapeType.Artboard);
    const saveSelectShape = selection.selectedShapes.filter(s => s.type !== ShapeType.Artboard);
    if (artboards.length === 0) return;
    const page = selection.selectedPage;
    if (page) {
        const editor = props.context.editor4Page(page);
        const shapes = editor.dissolution_artboard(artboards as ArtboardView[]);
        if (shapes) {
            const selectShapes = [...saveSelectShape, ...shapes]
            props.context.nextTick(page, () => {
                const select = selectShapes.reduce((pre, cur) => {
                    const s = cur instanceof ShapeView ? cur : page.getShape(cur.id);
                    if (s) {
                        pre.push(s);
                    }
                    return pre;
                }, [] as ShapeView[])
                props.context.selection.rangeSelectShape(select);
            })
        }
    }
    emits('close');
}

function unGroup() {
    ungroup(props.context);
    emits('close');
}

function component() {
    const symbol = make_symbol(props.context, t);
    if (symbol) {
        const page = props.context.selection.selectedPage;
        page && props.context.nextTick(page, () => {
            const select = page.getShape(symbol.id);
            props.context.selection.selectShape(select);
        })
        props.context.navi.notify(Navi.COMP_LIST_CHANGED);
    }
    emits('close');
}

const autoLayout = () => {
    autoLayoutFn(props.context, t);
    emits('close');
}

const unAutoLayout = () => {
    unAutoLayoutFn(props.context);
    emits('close');
}

function instance() {
    const selection = props.context.selection;
    const page = selection.selectedPage;
    const ref_shapes = selection.selectedShapes;
    if (page) {
        const editor = props.context.editor4Page(page);
        const shapes = editor.extractSymbol(ref_shapes as SymbolRefView[]);
        if (shapes) {
            props.context.nextTick(page, () => {
                const select = shapes.reduce((pre, cur) => {
                    const s = cur instanceof ShapeView ? cur : page.getShape(cur.id);
                    if (s) {
                        pre.push(s);
                    }
                    return pre;
                }, [] as ShapeView[])
                props.context.selection.rangeSelectShape(select);
                emits('close');
            })
        }
    }
}

function editComps() {
    const refShape = props.context.selection.selectedShapes[0];
    const refId = refShape && (refShape instanceof SymbolRefView) ? refShape.refId : undefined
    if (!refId) return;
    const shape = get_shape_within_document(props.context, refId)
    if (shape) {
        shape_track(props.context, shape)
    }
    if (shape) {
        shape_track(props.context, shape)
        emits('close');
    }
}

function visible() {
    const shapes = props.context.selection.selectedShapes;
    const page = props.context.selection.selectedPage;
    if (!page) return emits('close');
    const editor = props.context.editor4Page(page);
    editor.toggleShapesVisible(shapes);
    props.context.selection.resetSelectShapes();
    emits('close');
}

function lock() {
    const shapes = props.context.selection.selectedShapes;
    const page = props.context.selection.selectedPage;
    if (!page) return emits('close');
    const editor = props.context.editor4Page(page);
    editor.toggleShapesLock(shapes);
    props.context.selection.resetSelectShapes();
    emits('close');
}

function toggle_title() {
    props.context.tool.setTitleVisible(!props.context.tool.isShowTitle);
    emits('close');
}

function hereEnter() {
    props.context.menu.notify(Menu.SHOW_PLACEMENT);
}

function hereOut() {
    props.context.menu.notify(Menu.HIDE_PLACEMENT);
}

function copyAsPNG() {
    props.context.menu.notify(Menu.WRITE_MEDIA);
    emits('close');
}

function copyProperties() {
    props.context.workspace.clipboard.write_properties();
    emits('close');
}

function pasteProperties() {
    props.context.workspace.clipboard.paste_properties();
    emits('close');
}

function mask() {
    useMask(props.context);
    emits('close');
}

function flatten() {
    flattenSelection(props.context);
    emits('close');
}

function outline() {
    outlineSelection(props.context);
    emits('close');
}

const plugins = props.context.pluginsMgr.search2("content.menu");
let comps: { component: any, params?: any }[] = [];

watchEffect(() => {
    comps=[]
    if (props.items.has(MenuItemType.Comment)) {
        comps.push({
            component: () => {
                return h(plugins.end[0].component, {
                    params: plugins.end[0].params,
                    context: props.context,
                    onClose: () => emits('close')
                })
            }
        });
    }
})

onMounted(() => {
    props.context.menu.watch(menu_watcher)
    document.addEventListener('mousedown', handleClickOutside);
})
onUnmounted(() => {
    props.context.menu.unwatch(menu_watcher);
    document.removeEventListener('mousedown', handleClickOutside);
})

import down_icon from '@/assets/icons/svg/down.svg';
import SvgIcon from '@/components/common/SvgIcon.vue';
import { group, ungroup } from "@/utils/group_ungroup";
</script>
<template>
    <div ref="menu" class="__context-menu" :style="{ width: `${width || 196}px` }" @mousedown.stop @mousemove.stop
        @click.stop>
        <div class="header" />
        <div v-if="items.has(MenuItemType.Layers)" class="menu-item"
            @mouseenter="(e: MouseEvent) => showLayerSubMenu(e, MenuItemType.Layers)" @mouseleave="closeLayerSubMenu">
            <span>{{ t('system.select_layer') }}</span>
            <SvgIcon :icon="down_icon" style="transform: rotate(-90deg)" />
            <div class="layers_menu" ref="layersMenu" v-if="showLayer === MenuItemType.Layers"
                :style="{ 'max-height': layersHeight + 'px' }">
                <Layers @close="emits('close')" :layers="props.layers" :context="props.context"></Layers>
            </div>
        </div>
        <div v-if="items.has(MenuItemType.Layers)"
            style="width: 100%; height: 1px; border-bottom: 1px solid #efefef; margin: 3px 0" />
        <div v-if="items.has(MenuItemType.All)" class="menu-item" @click="all">
            <span>{{ t('system.select_all') }}</span>
            <Key code="Ctrl A" />
        </div>
        <div v-if="items.has(MenuItemType.Copy)" class="menu-item" @click="copy">
            <span>{{ t('system.copy') }}</span>
            <Key code="Ctrl C" />
        </div>
        <div v-if="items.has(MenuItemType.CopyAs)" class="menu-item"
            @mouseenter="(e: MouseEvent) => showLayerSubMenu(e, MenuItemType.CopyAs)" @mouseleave="closeLayerSubMenu">
            <span>{{ t('system.copyAs') }}</span>
            <SvgIcon :icon="down_icon" style="transform: rotate(-90deg)" />
            <div class="layers_menu" ref="layersMenu" v-if="showLayer === MenuItemType.CopyAs">
                <div class="sub-item" @click="copyAsPNG">
                    <span>{{ t('clipboard.copyAsPNG') }}</span>
                    <Key code="Shift Ctrl C" />
                </div>
                <div class="sub-item" @click="copyProperties">
                    <span>{{ t('clipboard.copyStyle') }}</span>
                    <Key code="Ctrl Alt C" />
                </div>
                <div class="sub-item" @click="pasteProperties">
                    <span>{{ t('clipboard.pasteStyle') }}</span>
                    <Key code="Ctrl Alt V" />
                </div>
            </div>
        </div>
        <div v-if="items.has(MenuItemType.Cut)" class="menu-item" @click="cut">
            <span>{{ t('system.cut') }}</span>
            <Key code="Ctrl X" />
        </div>
        <div v-if="items.has(MenuItemType.Paste)" class="menu-item" @click="paste">
            <span>{{ t('system.paste') }}</span>
            <Key code="Ctrl V" />
        </div>
        <div v-if="items.has(MenuItemType.OnlyText)" class="menu-item" @click="paste_text">
            <span>{{ t('system.only_text') }}</span>
            <Key code="Ctrl Alt V" />
        </div>
        <div v-if="items.has(MenuItemType.PasteHere)" class="menu-item" @click="pasteHere" @mouseenter="hereEnter"
            @mouseleave="hereOut">
            <span>{{ t('system.paste_here') }}</span>
        </div>
        <div v-if="items.has(MenuItemType.Replace)" class="menu-item" @click="_replace">
            <span>{{ t('system.replace') }}</span>
        </div>
        <div v-if="items.has(MenuItemType.Half)"
            style="width: 100%; height: 1px; border-bottom: 1px solid #efefef; margin: 3px 0" />
        <div v-if="items.has(MenuItemType.Half)" @click="(e: MouseEvent) => half(e)" class="menu-item">
            <span>50%</span>
        </div>
        <div v-if="items.has(MenuItemType.Hundred)" @click="(e: MouseEvent) => hundred(e)" class="menu-item">
            <span>100%</span>
            <Key code="Ctrl 0" />
        </div>
        <div v-if="items.has(MenuItemType.Double)" @click="(e: MouseEvent) => double(e)" class="menu-item">
            <span>200%</span>
        </div>
        <div v-if="items.has(MenuItemType.Canvas)" @click="canvas" class="menu-item">
            <span>{{ t('system.fit_canvas') }}</span>
        </div>
        <div v-if="items.has(MenuItemType.Cursor)"
            style="width: 100%; height: 1px; border-bottom: 1px solid #efefef; margin: 3px 0" />
        <div v-if="items.has(MenuItemType.Cursor)" @click="_cursor" class="menu-item">
            <span>{{ t('system.show_many_cursor') }}</span>
            <svg v-if="cursor" class="check" xmlns="http://www.w3.org/2000/svg" width="9" height="6"
                viewBox="0 0 15 10.833333969116211"
                style="position: absolute; top: 50%; left:10px; transform: translateY(-50%)">
                <path
                    d="M14.7559,0.244078C15.0813,0.569514,15.0813,1.09715,14.7559,1.42259C14.7559,1.42259,5.58926,10.5893,5.58926,10.5893C5.26382,10.9147,4.73618,10.9147,4.41074,10.5893C4.41074,10.5893,0.244077,6.42259,0.244077,6.42259C-0.0813592,6.09715,-0.0813592,5.56952,0.244077,5.24408C0.569514,4.91864,1.09715,4.91864,1.42259,5.24408C1.42259,5.24408,5,8.8215,5,8.8215C5,8.8215,13.5774,0.244078,13.5774,0.244078C13.9028,-0.0813593,14.4305,-0.0813593,14.7559,0.244078C14.7559,0.244078,14.7559,0.244078,14.7559,0.244078Z"
                    fill-rule="evenodd" fill="inherit" fill-opacity="1" />
            </svg>
        </div>
        <div v-if="items.has(MenuItemType.Cutout)" @click="_cutout" class="menu-item">
            <span>{{ t('system.show_cutout') }}</span>
            <svg v-if="cutout" class="check" xmlns="http://www.w3.org/2000/svg" width="9" height="6"
                viewBox="0 0 15 10.833333969116211"
                style="position: absolute; top: 50%; left:10px; transform: translateY(-50%)">
                <path
                    d="M14.7559,0.244078C15.0813,0.569514,15.0813,1.09715,14.7559,1.42259C14.7559,1.42259,5.58926,10.5893,5.58926,10.5893C5.26382,10.9147,4.73618,10.9147,4.41074,10.5893C4.41074,10.5893,0.244077,6.42259,0.244077,6.42259C-0.0813592,6.09715,-0.0813592,5.56952,0.244077,5.24408C0.569514,4.91864,1.09715,4.91864,1.42259,5.24408C1.42259,5.24408,5,8.8215,5,8.8215C5,8.8215,13.5774,0.244078,13.5774,0.244078C13.9028,-0.0813593,14.4305,-0.0813593,14.7559,0.244078C14.7559,0.244078,14.7559,0.244078,14.7559,0.244078Z"
                    fill-rule="evenodd" fill="inherit" fill-opacity="1" />
            </svg>
        </div>
        <div v-if="items.has(MenuItemType.Rule)"
            style="width: 100%; height: 1px; border-bottom: 1px solid #efefef; margin: 3px 0" />
        <div v-if="items.has(MenuItemType.Rule)" @click="ruler" class="menu-item">
            <span>{{ t('system.show_ruler') }}</span>
            <svg class="check" xmlns="http://www.w3.org/2000/svg" width="9" height="6"
                viewBox="0 0 15 10.833333969116211"
                style="position: absolute; top: 50%; left:10px; transform: translateY(-50%)">
                <path
                    d="M14.7559,0.244078C15.0813,0.569514,15.0813,1.09715,14.7559,1.42259C14.7559,1.42259,5.58926,10.5893,5.58926,10.5893C5.26382,10.9147,4.73618,10.9147,4.41074,10.5893C4.41074,10.5893,0.244077,6.42259,0.244077,6.42259C-0.0813592,6.09715,-0.0813592,5.56952,0.244077,5.24408C0.569514,4.91864,1.09715,4.91864,1.42259,5.24408C1.42259,5.24408,5,8.8215,5,8.8215C5,8.8215,13.5774,0.244078,13.5774,0.244078C13.9028,-0.0813593,14.4305,-0.0813593,14.7559,0.244078C14.7559,0.244078,14.7559,0.244078,14.7559,0.244078Z"
                    fill-rule="evenodd" fill="inherit" fill-opacity="1" />
            </svg>
        </div>
        <div v-if="items.has(MenuItemType.Pixel)" @click="pixel" class="menu-item">
            <span>{{ t('system.show_pixel_network') }}</span>
        </div>
        <div v-if="items.has(MenuItemType.Title)" @click="toggle_title" class="menu-item">
            <span>{{ t('system.artboart_title_visible') }}</span>
            <svg v-if="title" class="check" xmlns="http://www.w3.org/2000/svg" width="9" height="6"
                viewBox="0 0 15 10.833333969116211"
                style="position: absolute; top: 50%; left:10px; transform: translateY(-50%)">
                <path
                    d="M14.7559,0.244078C15.0813,0.569514,15.0813,1.09715,14.7559,1.42259C14.7559,1.42259,5.58926,10.5893,5.58926,10.5893C5.26382,10.9147,4.73618,10.9147,4.41074,10.5893C4.41074,10.5893,0.244077,6.42259,0.244077,6.42259C-0.0813592,6.09715,-0.0813592,5.56952,0.244077,5.24408C0.569514,4.91864,1.09715,4.91864,1.42259,5.24408C1.42259,5.24408,5,8.8215,5,8.8215C5,8.8215,13.5774,0.244078,13.5774,0.244078C13.9028,-0.0813593,14.4305,-0.0813593,14.7559,0.244078C14.7559,0.244078,14.7559,0.244078,14.7559,0.244078Z"
                    fill-rule="evenodd" fill="inherit" fill-opacity="1" />
            </svg>
        </div>
        <component v-if="comps.length" v-for="c in comps" :is=c.component :context="props.context" :params="c.params" />
        <div v-if="items.has(MenuItemType.Operation)" @click="operation" class="menu-item">
            <span>{{ context.layout.next }}</span>
            <Key code="Ctrl \"></Key>
        </div>
        <div v-if="items.has(MenuItemType.Forward)"
            style="width: 100%; height: 1px; border-bottom: 1px solid #efefef; margin: 3px 0" />
        <div v-if="items.has(MenuItemType.Forward)" @click="forward" class="menu-item">
            <span>{{ t('system.bring_forward') }}</span>
            <Key code="Ctrl ]"></Key>
        </div>
        <div v-if="items.has(MenuItemType.Back)" @click="back" class="menu-item">
            <span>{{ t('system.send_backward') }}</span>
            <Key code="Ctrl ["></Key>
        </div>
        <div v-if="items.has(MenuItemType.Top)" @click="top" class="menu-item">
            <span>{{ t('system.bring_to_top') }}</span>
            <Key code="["></Key>
        </div>
        <div v-if="items.has(MenuItemType.Bottom)" @click="bottom" class="menu-item">
            <span>{{ t('system.send_to_bottom') }}</span>
            <Key code="]"></Key>
        </div>
        <div v-if="items.has(MenuItemType.Groups)"
            style="width: 100%; height: 1px; border-bottom: 1px solid #efefef; margin: 3px 0" />
        <div v-if="items.has(MenuItemType.Groups)" @click="groups" class="menu-item">
            <span>{{ t('system.creating_groups') }}</span>
            <Key code="Ctrl G"></Key>
        </div>
        <div v-if="items.has(MenuItemType.Container)" @click="container" class="menu-item">
            <span>{{ t('system.create_container') }}</span>
            <Key code="Ctrl Alt G"></Key>
        </div>
        <div v-if="items.has(MenuItemType.Flatten)" @click="flatten" class="menu-item">
            <span>{{ t('bool.cohere') }}</span>
            <Key code="Ctrl E"></Key>
        </div>
        <div v-if="items.has(MenuItemType.Outline)" @click="outline" class="menu-item">
            <span>{{ t('system.outline') }}</span>
            <Key code="Ctrl Alt O"></Key>
        </div>
        <div v-if="items.has(MenuItemType.Mask)" @click="mask" class="menu-item">
            <span>{{ t('system.set_mask') }}</span>
            <Key code="Ctrl Alt M"></Key>
        </div>
        <div v-if="items.has(MenuItemType.UnGroup)" @click="unGroup" class="menu-item">
            <span>{{ t('system.un_group') }}</span>
            <Key code="Shift Ctrl G"></Key>
        </div>
        <div v-if="items.has(MenuItemType.Dissolution)" @click="dissolution_container" class="menu-item">
            <span>{{ t('system.dissolution') }}</span>
            <Key code="Shift Ctrl G"></Key>
        </div>
        <div v-if="items.has(MenuItemType.UnMask)" @click="mask" class="menu-item">
            <span>{{ t('system.remove_mask') }}</span>
            <Key code="Ctrl Alt M"></Key>
        </div>
        <div v-if="items.has(MenuItemType.Component) || items.has(MenuItemType.UnAutoLayout) || items.has(MenuItemType.AutoLayout)"
            style="width: 100%; height: 1px; border-bottom: 1px solid #efefef; margin: 3px 0" />
        <div v-if="items.has(MenuItemType.UnAutoLayout)" @click="unAutoLayout" class="menu-item">
            <span>{{ t('autolayout.remove_auto_layout') }}</span>
            <Key code="Shift Alt A"></Key>
        </div>
        <div v-if="items.has(MenuItemType.AutoLayout)" @click="autoLayout" class="menu-item">
            <span>{{ t('autolayout.add_auto_layout') }}</span>
            <Key code="Shift A"></Key>
        </div>
        <div v-if="items.has(MenuItemType.Component)" @click="component" class="menu-item">
            <span>{{ t('system.create_component') }}</span>
            <Key code="Ctrl Alt K"></Key>
        </div>
        <div v-if="items.has(MenuItemType.Instance)" @click="instance" class="menu-item">
            <span>{{ t('system.unbind_instance') }}</span>
            <Key code="Ctrl Alt B"></Key>
        </div>
        <div v-if="items.has(MenuItemType.EditComps)" @click="editComps" class="menu-item">
            <span>{{ t('system.edit_component') }}</span>
        </div>
        <div v-if="items.has(MenuItemType.Visible)"
            style="width: 100%; height: 1px; border-bottom: 1px solid #efefef; margin: 3px 0" />
        <div v-if="items.has(MenuItemType.Visible)" @click="visible" class="menu-item">
            <span>{{ t('system.visible') }}</span>
            <Key code="Shift Ctrl H"></Key>
        </div>
        <div v-if="items.has(MenuItemType.Lock)" @click="lock" class="menu-item">
            <span>{{ t('system.Lock') }}</span>
            <Key code="Shift Ctrl L"></Key>
        </div>
        <TableMenu :context="context" :items="items" @close="emits('close')"></TableMenu>
        <div class="bottom" />
    </div>
</template>
<style scoped lang="scss">
.__context-menu {
    position: absolute;
    z-index: 99;

    width: 240px;
    border-radius: 8px;
    box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.08);
    background-color: #FFFFFF;
    border: 1px solid #EBEBEB;
    box-sizing: border-box;

    cursor: auto !important;

    >.header {
        width: 100%;
        height: 6px;
    }

    >.menu-item {
        position: relative;

        width: 100%;
        height: 32px;
        background-color: #FFF;
        color: #000;

        display: flex;
        align-items: center;
        justify-content: space-between;

        padding: 0 16px 0 28px;
        font-size: var(--font-default-fontsize);

        box-sizing: border-box;

        transition: 50ms;

        .check {
            fill: #000;
        }

        >img {
            width: 9px;
            height: 9px;

            right: 10px;
        }

        .layers_menu {
            position: absolute;
            z-index: 99;
            color: #262626;
            width: 196px;
            display: flex;
            flex-direction: column;
            border-radius: 8px;
            box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.08);
            background-color: #FFFFFF;
            border: 1px solid #EBEBEB;
            padding: 6px 0;
            top: -6px;
            box-sizing: border-box;
            cursor: auto !important;
        }

        .sub-item {
            padding: 0 8px;
            width: 100%;
            height: 32px;
            line-height: 32px;
            box-sizing: border-box;
            color: #000000;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .sub-item:hover {
            background-color: #1878F5;
            color: #fff;
        }
    }


    >.menu-item:hover {
        background-color: var(--active-color);
        color: #FFF;

        .check {
            fill: #FFF;
        }

        >img {
            // fill: #fff;
            filter: invert(1);
            transform: rotate(0deg);
        }
    }

    >.bottom {
        width: 100%;
        height: 6px;
    }
}
</style>
