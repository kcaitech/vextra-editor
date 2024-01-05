<script setup lang='ts'>
import { onUnmounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import ContextMenu from '@/components/common/ContextMenu.vue';
import Key from '@/components/common/Key.vue';
import { XY } from '@/context/selection';
import {
    Artboard,
    GroupShape,
    Shape,
    ShapeType,
    SymbolRefShape,
    TableCellType,
    TextShape,
    Text,
    ShapeView,
    TextShapeView,
    adapt2Shape,
    GroupShapeView
} from "@kcdesign/data";
import Layers from './Layers.vue';
import { Context } from '@/context';
import { WorkSpace } from '@/context/workspace';
import { Selection } from '@/context/selection';
import { adapt_page, getName, get_shape_within_document, shape_track } from '@/utils/content';
import { message } from '@/utils/message';
import { paster, paster_inner_shape, replace } from '@/utils/clipboard';
import { compare_layer_3 } from '@/utils/group_ungroup';
import { Menu } from '@/context/menu';
import TableMenu from "./TableMenu/TableMenu.vue"
import { make_symbol } from '@/utils/symbol';
import { Tool } from "@/context/tool";
import SvgIcon from "@/components/common/SvgIcon.vue";
import { hover } from '@/utils/listview';

const { t } = useI18n();

interface Props {
    context: Context,
    layers?: ShapeView[],
    items: string[],
    site?: { x: number, y: number }
}

const props = defineProps<Props>();
const emit = defineEmits<{
    (e: 'close'): void;
}>();
const layerSubMenuPosition: XY = reactive({ x: 0, y: 0 });
const layerSubMenuVisiable = ref<boolean>(false);
const isComment = ref<boolean>(props.context.comment.isVisibleComment);
const isTitle = ref<boolean>(props.context.tool.isShowTitle);
const isCursor = ref<boolean>(props.context.menu.isUserCursorVisible);
const invalid_items = ref<string[]>([]);

function showLayerSubMenu(e: MouseEvent, type: string) {
    layerSubMenuPosition.x = (e.target as Element).getBoundingClientRect().width;
    layerSubMenuPosition.y = -10;
    layerSubMenuVisiable.value = true;
    hoverItem.value = type;
}

function is_inner_textshape(): (ShapeView | Shape) & { text: Text } | undefined {
    const selected = props.context.selection.selectedShapes;
    const isEditing = props.context.workspace.isEditing;
    if (selected.length === 1 && selected[0].type === ShapeType.Text && (selected[0] as TextShapeView).text && isEditing) {
        return selected[0] as TextShapeView;
    }
    if (selected.length === 1 && selected[0].type === ShapeType.Table) {
        const tableSelection = props.context.tableSelection;
        if (tableSelection.editingCell && tableSelection.editingCell.cell && tableSelection.editingCell.cell.cellType === TableCellType.Text) {
            return tableSelection.editingCell.cell as any as Shape & { text: Text }
        }
    }
    // return false;
}

function copy() {
    const textlike = is_inner_textshape();
    if (textlike) {
        const selection = props.context.textSelection;
        const start = selection.cursorStart;
        const end = selection.cursorEnd;
        const s = Math.min(start, end);
        const len = Math.abs(start - end);
        if (s === end) return emit('close');
        const t = textlike.text.getTextWithFormat(s, len);
        props.context.workspace.clipboard.write_html(t);
    } else {
        props.context.workspace.clipboard.write_html();
    }
    emit('close');
}

async function cut() {
    const textlike = is_inner_textshape();
    if (textlike) {
        const selection = props.context.textSelection;
        const start = selection.cursorStart;
        const end = selection.cursorEnd;
        if (start === end) return emit('close');
        const t = textlike.text.getTextWithFormat(Math.min(start, end), Math.abs(start - end));
        const copy_result = await props.context.workspace.clipboard.write_html(t);
        if (copy_result) {
            const editor = props.context.editor4TextShape(textlike as TextShape);
            if (editor.deleteText(Math.min(start, end), Math.abs(start - end))) {
                selection.setCursor(Math.min(start, end), false);
            }
        }
    }
    emit('close');
}

function paste() {
    if (invalid_items.value.includes('paste')) return;
    const textlike = is_inner_textshape();
    if (textlike) {
        const editor = props.context.editor4TextShape(textlike as TextShape);
        paster_inner_shape(props.context, editor);
    } else {
        paster(props.context, t);
    }
    emit('close');
}

function paste_text() {
    if (invalid_items.value.includes('paste-text')) return;
    const textlike = is_inner_textshape();
    if (textlike) {
        const editor = props.context.editor4TextShape(textlike as TextShape);
        paster_inner_shape(props.context, editor, true);
    }
    emit('close');
}

function paste_here() {
    if (invalid_items.value.includes('paste-here')) return;
    props.context.workspace.notify(WorkSpace.PASTE_RIGHT);
    emit('close');
}

function _replace() {
    if (invalid_items.value.includes('replace')) return;
    const selection = props.context.selection;
    const selected = selection.selectedShapes;
    if (selected.length) {
        replace(props.context, selected);
    }
    emit('close');
}

function selectAll() {
    const textlike = is_inner_textshape();
    if (textlike) {
        const text = textlike.text;
        const end = text.length;
        props.context.textSelection.selectText(0, end);
    } else {
        props.context.workspace.keydown_a(true, true);
    }
    emit('close');
}

/**
 * 50%视图
 */
function half(e: MouseEvent) {
    e.preventDefault();
    page_scale(e, 0.5);
    emit('close');
}

/**
 * 全比例视图
 */
function hundred(e: MouseEvent) {
    e.preventDefault();
    page_scale(e, 1);
    emit('close');
}

/**
 * 两倍视图
 */
function double(e: MouseEvent) {
    e.preventDefault();
    page_scale(e, 2);
    emit('close');
}

/**
 * 页面缩放
 * @param scale 缩放倍数 > 0
 */
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

/**
 * 使整个page在可视区域
 */
function canvas() {
    adapt_page(props.context);
    emit('close');
}

function cursor() {
    const status = props.context.menu.isUserCursorVisible;
    isCursor.value = !status;
    props.context.menu.setVisibleCursor(isCursor.value);
    emit('close');
}

function comment() {
    const status = props.context.comment.isVisibleComment;
    isComment.value = !status;
    props.context.comment.setVisibleComment(isComment.value);
    emit('close');
}

function ruler() {
}

function pixel() {
}

function operation() {
    props.context.workspace.notify(WorkSpace.HIDDEN_UI);
    emit('close');
}

/**
 * 上移一层
 */
function forward() {
    const selection = props.context.selection;
    const page = selection.selectedPage;
    if (page) {
        const editor = props.context.editor4Page(page);
        const result = editor.uppper_layer(adapt2Shape(selection.selectedShapes[0]), 1);
        if (!result) {
            message('info', props.context.workspace.t('homerightmenu.unable_upper'));
        } else {
            emit('close');
        }
    }

}

/**
 * 下移一层
 */
function back() {
    const selection = props.context.selection;
    const page = selection.selectedPage;
    if (page) {
        const editor = props.context.editor4Page(page);
        const result = editor.lower_layer(adapt2Shape(selection.selectedShapes[0]), 1);
        if (!result) {
            message('info', props.context.workspace.t('homerightmenu.unable_lower'));
        } else {
            emit('close');
        }
    }
}

/**
 * 置于顶层
 */
function top() {
    const selection = props.context.selection;
    const page = selection.selectedPage;
    if (page) {
        const editor = props.context.editor4Page(page);
        const result = editor.uppper_layer(adapt2Shape(selection.selectedShapes[0]));
        if (!result) {
            message('info', props.context.workspace.t('homerightmenu.unable_upper'));
        } else {
            emit('close');
        }
    }
}

/**
 * 置于底层
 */
function bottom() {
    const selection = props.context.selection;
    const page = selection.selectedPage;
    if (page) {
        const editor = props.context.editor4Page(page);
        const result = editor.lower_layer(adapt2Shape(selection.selectedShapes[0]));
        if (!result) {
            message('info', props.context.workspace.t('homerightmenu.unable_lower'));
        } else {
            emit('close');
        }
    }
}

/**
 * 创建编组
 */
function groups() {
    props.context.tool.notify(Tool.GROUP); // 发送到tool，由tool去处理
    emit('close');
}

/**
 * 创建容器
 */
function container() {
    props.context.tool.notify(Tool.GROUP, true);
    emit('close');
}

/**
 * 解除容器
 */
function dissolution_container() {
    const selection = props.context.selection;
    const artboards = selection.selectedShapes.filter(s => s.type === ShapeType.Artboard);
    const saveSelectShape = selection.selectedShapes.filter(s => s.type !== ShapeType.Artboard);
    if (artboards.length === 0) return;
    const page = selection.selectedPage;
    if (page) {
        const editor = props.context.editor4Page(page);
        const shapes = editor.dissolution_artboard(artboards.map(s => adapt2Shape(s)) as Artboard[]);
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
    emit('close');
}

/**
 * 解除编组
 */
function unGroup() {
    const groups = props.context.selection.selectedShapes.filter(s => s.type === ShapeType.Group && !(s as GroupShapeView).data.isBoolOpShape);
    const saveSelectShape = props.context.selection.selectedShapes.filter(s => s.type !== ShapeType.Group || (s as GroupShapeView).data.isBoolOpShape);
    if (groups.length === 0) return;
    const page = props.context.selection.selectedPage;
    if (page) {
        const editor = props.context.editor4Page(page);
        const shapes = editor.ungroup(groups.map(s => adapt2Shape(s)) as GroupShape[]);
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
    emit('close');
}

function component() {
    const symbol = make_symbol(props.context, t);
    if (symbol) {
        const page = props.context.selection.selectedPage;
        page && props.context.nextTick(page, () => {
            const select = page.getShape(symbol.id);
            props.context.selection.selectShape(select);
        })
    }
    emit('close');
}

function instance() {
    const selection = props.context.selection;
    const page = selection.selectedPage;
    const ref_shapes = selection.selectedShapes;
    if (page) {
        const editor = props.context.editor4Page(page);
        const shapes = editor.extractSymbol(ref_shapes.map(s => adapt2Shape(s)) as SymbolRefShape[]);
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
                emit('close');
            })
        }
    }
}

function reset() {
}

function edit() {
    const refShape = props.context.selection.selectedShapes[0];
    const refId = refShape && (refShape instanceof SymbolRefShape) ? refShape.refId : undefined;
    if (!refId) return;
    const shape = get_shape_within_document(props.context, refId)
    if (shape) {
        shape_track(props.context, shape)
        emit('close');
    }
}

/**
 * 隐藏图层
 */
function visible() {
    const shapes = props.context.selection.selectedShapes;
    const page = props.context.selection.selectedPage;
    if (!page) return emit('close');
    const editor = props.context.editor4Page(page);
    editor.toggleShapesVisible(shapes.map(s => adapt2Shape(s)));
    props.context.selection.resetSelectShapes();
    emit('close');
}

/**
 * 解锁
 */
function lock() {
    const shapes = props.context.selection.selectedShapes;
    const page = props.context.selection.selectedPage;
    if (!page) return emit('close');
    const editor = props.context.editor4Page(page);
    editor.toggleShapesLock(shapes.map(s => adapt2Shape(s)));
    props.context.selection.resetSelectShapes();
    emit('close');
}
const hoverItem = ref('');
const mouseenter = (type: string) => {
    hoverItem.value = type;
}

/**
 * 关闭图层菜单
 */
function closeLayerSubMenu() {
    layerSubMenuVisiable.value = false;
    hoverItem.value = '';
}

function show_placement(val: boolean) {
    if (invalid_items.value.includes('paste-here')) return;
    props.context.menu.notify(val ? Menu.SHOW_PLACEMENT : Menu.HIDE_PLACEMENT);
}

function toggle_title() {
    props.context.tool.setTitleVisible(!props.context.tool.isShowTitle);
    emit('close');
}

function menu_watcher() {
    // check();
}

const stop = watch(() => props.items, menu_watcher, { deep: true, immediate: true })
onUnmounted(() => {
    stop();
})
</script>
<template>
    <div class="items-wrap" @mousedown.stop @click.stop>
        <div v-if="props.items.includes('layers')" class="item layer-select"
            @mouseenter="(e: MouseEvent) => showLayerSubMenu(e, 'layer-select')" @mouseleave="closeLayerSubMenu">
            <span>{{ t('system.select_layer') }}</span>
            <!--            <div class="triangle"></div>-->
            <svg-icon :icon-class="hoverItem === 'layer-select' ? 'white-down' : 'down'"
                style="transform: rotate(-90deg);margin-left: 62px"></svg-icon>
            <ContextMenu v-if="layerSubMenuVisiable" :x="layerSubMenuPosition.x" :y="layerSubMenuPosition.y" :width="174"
                :site="site" :context="props.context">
                <Layers @close="emit('close')" :layers="props.layers" :context="props.context"></Layers>
            </ContextMenu>
        </div>
        <div class="line" v-if="props.items.includes('layers')"></div>
        <!-- 常用功能 -->
        <div class="item" v-if="props.items.includes('all')" @click="selectAll">
            <span>{{ t('system.select_all') }}</span>
            <span class="shortkey">
                <Key code="Ctrl A"></Key>
            </span>
        </div>
        <div class="item" v-if="props.items.includes('copy')" @click="copy">
            <span>{{ t('system.copy') }}</span>
            <span class="shortkey">
                <Key code="Ctrl C"></Key>
            </span>
        </div>
        <div class="item" v-if="props.items.includes('cut')" @click="cut">
            <span>{{ t('system.cut') }}</span>
            <span class="shortkey">
                <Key code="Ctrl X"></Key>
            </span>
        </div>
        <div :class="invalid_items.includes('paste') ? 'invalid' : 'item'" v-if="props.items.includes('paste')"
            @click="paste">
            <span>{{ t('system.paste') }}</span>
            <span class="shortkey">
                <Key code="Ctrl V"></Key>
            </span>
        </div>
        <div :class="invalid_items.includes('only_text') ? 'invalid' : 'item'" v-if="props.items.includes('only_text')"
            @click="paste_text">
            <span>{{ t('system.only_text') }}</span>
            <span class="shortkey">
                <Key code="Alt Ctrl V"></Key>
            </span>
        </div>
        <div :class="invalid_items.includes('paste-here') ? 'invalid' : 'item'" v-if="props.items.includes('paste-here')"
            @click="paste_here" @mouseenter="() => { show_placement(true) }" @mouseleave="() => { show_placement(false) }">
            <span>{{ t('system.paste_here') }}</span>
        </div>
        <div :class="invalid_items.includes('replace') ? 'invalid' : 'item'" v-if="props.items.includes('replace')"
            @click="_replace">
            <span>{{ t('system.replace') }}</span>
            <span class="shortkey">
                <Key code="Shift Ctrl R"></Key>
            </span>
        </div>

        <!-- 视图比例 -->
        <div class="line" v-if="props.items.includes('half')"></div>
        <div class="item" v-if="props.items.includes('half')" @click="(e: MouseEvent) => half(e)">
            <span>50%</span>
        </div>
        <div class="item" v-if="props.items.includes('hundred')" @click="(e: MouseEvent) => hundred(e)">
            <span>100%</span>
            <span class="shortkey">
                <Key code="Ctrl 0"></Key>
            </span>
        </div>
        <div class="item" v-if="props.items.includes('double')" @click="(e: MouseEvent) => double(e)">
            <span>200%</span>
        </div>
        <div class="item" v-if="props.items.includes('canvas')" @click="canvas">
            <span>{{ t('system.fit_canvas') }}</span>
            <span class="shortkey">
                <Key code="Ctrl 1"></Key>
            </span>
        </div>
        <!-- 协作 -->
        <div class="line" v-if="props.items.includes('cursor')"></div>
        <div class="item" v-if="props.items.includes('cursor')" @click="cursor" @mouseenter="mouseenter('cursor')"
            @mouseleave="hoverItem = ''">
            <!--            <div class="choose" v-show="isCursor"></div>-->
            <svg-icon :icon-class="hoverItem === 'cursor' ? 'white-select' : 'page-select'" v-show="isCursor"></svg-icon>
            <span :style="{ marginLeft: isCursor ? '8px' : '20px' }">{{ t('system.show_many_cursor') }}</span>
        </div>
        <div class="item" v-if="props.items.includes('comment')" @click="comment" @mouseenter="mouseenter('comment')"
            @mouseleave="hoverItem = ''">
            <!--            <div class="choose" v-show="isComment"></div>-->
            <svg-icon :icon-class="hoverItem === 'comment' ? 'white-select' : 'page-select'" v-show="isComment"></svg-icon>
            <span :style="{ marginLeft: isComment ? '8px' : '20px' }">{{ t('system.show_comment') }}</span>
            <span class="shortkey">
                <Key code="Shift C"></Key>
            </span>
        </div>
        <!-- 界面显示 -->
        <div class="line" v-if="props.items.includes('ruler')"></div>
        <div class="item" v-if="props.items.includes('ruler')" @click="ruler">
            <div class="choose"></div>
            <span>{{ t('system.show_ruler') }}</span>
        </div>
        <div class="item" v-if="props.items.includes('pixel')" @click="pixel">
            <div class="choose"></div>
            <span>{{ t('system.show_pixel_network') }}</span>
            <span></span>
        </div>
        <div class="item" v-if="props.items.includes('operation')" @click="operation">
            <span>{{ t('system.hide_operation_interface') }}</span>
            <span class="shortkey">
                <Key code="Ctrl(Shift) \"></Key>
            </span>
        </div>
        <!-- 顺序调整 -->
        <div class="line" v-if="props.items.includes('forward')"></div>
        <div class="item" v-if="props.items.includes('forward')" @click="forward">
            <span>{{ t('system.bring_forward') }}</span>
            <span class="shortkey">
                <Key code="+"></Key>
            </span>
        </div>
        <div class="item" v-if="props.items.includes('back')" @click="back">
            <span>{{ t('system.send_backward') }}</span>
            <span class="shortkey">- </span>
        </div>
        <div class="item" v-if="props.items.includes('top')" @click="top">
            <span>{{ t('system.bring_to_top') }}</span>
            <span class="shortkey">]</span>
        </div>
        <div class="item" v-if="props.items.includes('bottom')" @click="bottom">
            <span>{{ t('system.send_to_bottom') }}</span>
            <span class="shortkey">[</span>
        </div>
        <!-- 组合容器 -->
        <div class="line" v-if="props.items.includes('groups')"></div>
        <div class="item" v-if="props.items.includes('groups')" @click="groups">
            <span>{{ t('system.creating_groups') }}</span>
            <span class="shortkey">
                <Key code="Ctrl G"></Key>
            </span>
        </div>
        <div class="item" v-if="props.items.includes('container')" @click="container">
            <span>{{ t('system.create_container') }}</span>
            <span class="shortkey">
                <Key code="Alt Ctrl G"></Key>
            </span>
        </div>
        <div class="item" v-if="props.items.includes('un_group')" @click="unGroup">
            <span>{{ t('system.un_group') }}</span>
            <span class="shortkey">
                <Key code="Shift Ctrl G"></Key>
            </span>
        </div>
        <div class="item" v-if="props.items.includes('dissolution')" @click="dissolution_container">
            <span>{{ t('system.dissolution') }}</span>
            <span class="shortkey">
                <Key code="Shift Ctrl G"></Key>
            </span>
        </div>
        <!-- 组件操作 -->
        <div class="line" v-if="props.items.includes('component')"></div>
        <div class="item" v-if="props.items.includes('component')" @click="component">
            <span>{{ t('system.create_component') }}</span>
            <span class="shortkey">
                <Key code="Alt Ctrl K"></Key>
            </span>
        </div>
        <div class="item" v-if="props.items.includes('instance')" @click="instance">
            <span>{{ t('system.unbind_instance') }}</span>
            <span></span>
        </div>
        <div class="item" v-if="props.items.includes('reset')" @click="reset">
            <span>{{ t('system.reset_instance_roperties') }}</span>
            <span></span>
        </div>
        <div class="item" v-if="props.items.includes('edit')" @click="edit">
            <span>{{ t('system.edit_component') }}</span>
            <span></span>
        </div>
        <!-- 隐藏/锁定 -->
        <div class="line" v-if="props.items.includes('visible')"></div>
        <div class="item" v-if="props.items.includes('visible')" @click="visible">
            <span>{{ t('system.visible') }}</span>
            <span class="shortkey">
                <Key code="Shift Ctrl H"></Key>
            </span>
        </div>
        <div class="item" v-if="props.items.includes('lock')" @click="lock">
            <span>{{ t('system.Lock') }}</span>
            <span class="shortkey">
                <Key code="Shift Ctrl L"></Key>
            </span>
        </div>
        <div class="item" v-if="props.items.includes('title')" @click="toggle_title" @mouseenter="mouseenter('title')"
            @mouseleave="hoverItem = ''">
            <!--            <div class="choose" v-show="isTitle"></div>-->
            <svg-icon :icon-class="hoverItem === 'title' ? 'white-select' : 'page-select'" v-show="isTitle"></svg-icon>
            <span :style="{ marginLeft: isTitle ? '8px' : '20px' }">{{ t('system.artboart_title_visible') }}</span>
        </div>
        <TableMenu :context="context" :layers="layers" :items="items" :site="site" @close="emit('close')"></TableMenu>
    </div>
</template>
<style lang='scss' scoped>
.items-wrap {
    width: 100%;
    font-size: var(--font-default-fontsize);

    .item {
        position: relative;
        width: 100%;
        height: 32px;
        padding: 9px 24px 9px 8px;
        display: flex;
        flex-direction: row;
        align-items: center;
        box-sizing: border-box;

        >span {
            margin-left: 20px;
        }

        >svg {
            width: 12px;
            height: 12px;
        }

        >.shortkey {
            margin-left: auto;
        }
    }

    .line {
        width: 100%;
        height: 4px;
        border-bottom: 1px solid #EBEBEB;
        //margin-bottom: 8px;
        box-sizing: border-box;
    }

    .item:hover {
        background-color: #1878F5;
        color: #fff;

        >svg {
            transform: rotate(0deg);
        }
    }

    .invalid {
        position: relative;
        width: 100%;
        height: 28px;
        padding: 0 var(--default-padding) 0 20px;
        display: flex;
        flex-direction: row;
        align-items: center;
        box-sizing: border-box;
        background-color: var(--theme-color);
        color: grey;

        >.shortkey {
            margin-left: auto;
        }
    }

    .choose {
        position: absolute;
        left: 7px;
        box-sizing: border-box;
        width: 10px;
        height: 6px;
        border-width: 0 0 2px 2px;
        border-style: solid;
        border-color: var(--theme-color-anti);
        transform: rotate(-45deg) translateY(-4%);
    }
}
</style>