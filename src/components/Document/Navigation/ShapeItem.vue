<script setup lang="ts">
import { computed, InputHTMLAttributes, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { Shape, ShapeType, ShapeView } from '@kcdesign/data';
import { Context } from "@/context";
import { get_name } from "@/utils/shapelist";
import { Perm } from "@/context/workspace";
import { Tool } from "@/context/tool";
import { useI18n } from 'vue-i18n';
import { is_state } from "@/utils/symbol";
import { onUpdated } from "vue";
import { Selection } from "@/context/selection";
import { is_component_class } from "@/utils/listview";
import Abbr from "@/components/common/Abbr.vue";
import { debounce } from "lodash";
import { shutdown_menu } from "@/utils/mouse";
import { Navi } from "@/context/navigate";

export interface ItemData {
    id: string
    shape: () => Shape // 作用function，防止vue对shape内部数据进行proxy
    shapeview: () => ShapeView
    selected: boolean
    expand: boolean
    level: number
    context: Context
}

interface Props {
    data: ItemData
}

interface Emits {
    (e: "toggleexpand", shape: ShapeView): void;

    (e: "selectshape", shape: ShapeView, isCtrl: boolean, shift: boolean): void;

    (e: "hovershape", shape: ShapeView): void;

    (e: "unhovershape"): void;

    (e: "set-lock", shape: ShapeView): void;

    (e: "set-visible", shape: ShapeView): void;

    (e: "rename", name: string, shape: ShapeView, event?: KeyboardEvent): void;

    (e: "scrolltoview", shape: ShapeView): void;

    (e: "item-mousedown", event: MouseEvent, shape: ShapeView): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Emits>();

const lock_status = ref<number>(0) // 1：锁 2：继承锁 -1：不锁
const visible_status = ref<number>(1) // 1：隐藏 2： 继承隐藏 -1：显示
const is_tool_visible = ref<boolean>()
const isInput = ref<boolean>(false)
const nameInput = ref<HTMLInputElement | null>(null)
const esc = ref<boolean>(false)
const isread = ref(false)
const canComment = ref(false)
const isEdit = ref(false)
const ph_width = computed(() => (props.data.level - 1) * 18);
let showTriangle = ref<boolean>(false);
const watchedShapes = new Map();
const shapeItem = ref<HTMLDivElement | null>(null);
const t = useI18n().t;
const symbol_c = computed<boolean>(() => {
    return is_component_class(props.data.shapeview());
})
const abbr_view = ref<number>(0);

function toggleExpand(e: Event) {
    if (!showTriangle.value) {
        return;
    }
    e.stopPropagation();
    emits("toggleexpand", props.data.shapeview());
}

const toggleContainer = (e: MouseEvent) => {
    e.stopPropagation();
    props.data.context.navi.set_phase('');
    emits('scrolltoview', props.data.shapeview());
}
const fitToggleContainer = (e: MouseEvent) => {
    e.stopPropagation();
    props.data.context.navi.set_phase(props.data.shapeview().id);
    emits('scrolltoview', props.data.shapeview());
}

function hoverShape(e: MouseEvent) {
    if (e.buttons !== 0) {
        return;
    }
    emits("hovershape", props.data.shapeview());
    is_tool_visible.value = true;
}

function unHoverShape(e: MouseEvent) {
    if (e.buttons !== 0) {
        return;
    }
    e.stopPropagation();
    emits("unhovershape");
    is_tool_visible.value = false
}

const setLock = (e: MouseEvent) => {
    // if (lock_status.value === 2) {
    //     return; // 继承锁
    // }
    e.stopPropagation();
    emits('set-lock', props.data.shapeview())
}
const setVisible = (e: MouseEvent) => {
    // if (visible_status.value === 2) {
    //     return; // 继承隐藏
    // }
    e.stopPropagation();
    emits('set-visible', props.data.shapeview());
}
const onRename = () => {
    if (is_state(props.data.shapeview())
        || !isEdit.value
        || props.data.context.tool.isLable
    ) {
        return;
    }
    isInput.value = true
    nextTick(() => {
        if (!nameInput.value) {
            return;
        }
        (nameInput.value as HTMLInputElement).value = props.data.shape().name.trim();
        nameInput.value.focus();
        nameInput.value.select();
        nameInput.value?.addEventListener('blur', stopInput);
        nameInput.value?.addEventListener('keydown', keySaveInput);
    })
    document.addEventListener('click', onInputBlur);
}
const onChangeName = (e: Event) => {
    const value = (e.target as InputHTMLAttributes).value
    if (esc.value) {
        return;
    }
    if (value.length === 0 || value.length > 40 || value.trim().length === 0) {
        return
    }
    emits('rename', value, props.data.shapeview());
}

const stopInput = () => {
    esc.value = false
    isInput.value = false
}
const keySaveInput = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
        esc.value = false
        isInput.value = false
    } else if (e.code === 'Escape') {
        esc.value = true
        isInput.value = false
    }
}
const onInputBlur = (e: MouseEvent) => {
    if (e.target instanceof Element && !e.target.closest('.rename')) {
        var timer = setTimeout(() => {
            if (nameInput.value) {
                (nameInput.value).blur();
            }
            document.removeEventListener('click', onInputBlur);
            clearTimeout(timer);
        }, 10)
    }
}
const selectedChild = () => {
    let parent = props.data.shapeview().parent
    let child
    while (parent) {
        if (parent.type === ShapeType.Page) {
            break;
        }
        child = props.data.context.selection.isSelectedShape(parent)
        parent = parent.parent
        if (child) {
            return child
        }
    }
    return child
}

const mousedown = (e: MouseEvent) => {
    e.stopPropagation();
    shutdown_menu(e, props.data.context);
    if (e.button === 0) {
        const shape = props.data.shapeview();
        const { ctrlKey, metaKey, shiftKey } = e;
        const selected = props.data.context.selection.selectedShapes;
        if (selected.length > 1) {
            for (let i = 0, l = selected.length; i < l; i++) {
                if (selected[i].id === shape.id && !(e.ctrlKey || e.metaKey)) {
                    return;
                }
            }
        }
        emits("selectshape", shape, ctrlKey || metaKey, shiftKey);
        selectedChild();
    } else if (e.button === 2) {
        emits('item-mousedown', e, props.data.shapeview())
        selectedChild();
    }
}

function mouseup(e: MouseEvent) {
    if (e.button !== 0) {
        return;
    }
    if (props.data.context.selection.selectedShapes.length < 2) {
        return;
    }
    if (props.data.context.navi.is_item_dragging || e.metaKey || e.shiftKey || e.ctrlKey) {
        return;
    }
    emits("selectshape", props.data.shapeview(), false, false);
    selectedChild();
}

//获取文档权限
const handlePerm = () => {
    const perm = props.data.context.workspace.documentPerm
    if (perm === Perm.isRead) {
        isread.value = true
    } else if (perm === Perm.isComment) {
        isread.value = false
        canComment.value = true
    } else {
        isread.value = false
        canComment.value = false
        isEdit.value = true
    }
}

const isLable = ref(props.data.context.tool.isLable);
const tool_watcher = (t?: number) => {
    if (t === Tool.LABLE_CHANGE) {
        isLable.value = props.data.context.tool.isLable;
    }
}

function is_group() {
    return [ShapeType.Artboard, ShapeType.Group, ShapeType.Symbol].includes(props.data.shape().type);
}

function _updateAbbrView() {
    abbr_view.value++;
}

const update_abbr_view = debounce(_updateAbbrView, 800);

const update_icon = ref(0);
function updater(...args: any[]) {
    if (args.includes('frame') || args.includes('points')) {
        update_abbr_view();
        return;
    }
    if(args.includes('fills')) {
        update_icon.value++;
    }

    const shape = props.data.shapeview();

    const data = shape.data;

    const children = data.naviChilds || (data as any).childs || shape.naviChilds || [];
    showTriangle.value = children.length > 0 && shape.type !== ShapeType.Table;

    lock_status.value = shape.isLocked ? 1 : 0;
    visible_status.value = shape.isVisible ? 0 : 1;
}

let oldshape: Shape | undefined;
const stop = watch(() => props.data.id, (value, old) => {
    oldshape && oldshape.unwatch(updater);
    oldshape = props.data.shape();
    oldshape.watch(updater);
    watchShapes();
}, { immediate: true })

function watchShapes() {
    const needWatchShapes = new Map();
    let shape = props.data.shapeview();
    let p = shape.parent;
    while (p && p.type !== ShapeType.Page) {
        if (!p.__watcher.has(updater)) {
            needWatchShapes.set(p.id, p);
        }
        p = p.parent;
    }
    watchedShapes.forEach((v, k) => {
        if (needWatchShapes.has(k)) {
            return;
        }
        v.unwatch(updater);
        watchedShapes.delete(k);
    })
    needWatchShapes.forEach((v, k) => {
        if (watchedShapes.has(k)) {
            return;
        }
        v.watch(updater);
        watchedShapes.set(k, v);
    })
}
const topAngle = ref(false);
const bottomAngle = ref(false);
const current_node_radius = () => {
    if (shapeItem.value) {
        const isSelect = shapeItem.value.classList.contains('selected') || shapeItem.value.classList.contains('selectedChild');
        const previous = shapeItem.value.previousElementSibling;
        const next = shapeItem.value.nextElementSibling;
        const p_selected = previous && previous.classList.contains('selected') || previous && previous.classList.contains('selectedChild');
        const n_selected = next && next.classList.contains('selected') || next && next.classList.contains('selectedChild');
        if (!p_selected && isSelect) {
            topAngle.value = true;
        } else if (p_selected) {
            topAngle.value = false;
        }
        if (!n_selected && isSelect) {
            bottomAngle.value = true;
        } else if (n_selected) {
            bottomAngle.value = false;
        }
    }
}
const hovered = ref(false);
const selectedWatcher = (t?: any) => {
    if (t === Selection.CHANGE_SHAPE_HOVER) {
        getHovered();
    }
}
const getHovered = () => {
    const shape = props.data.shape();
    const hoverShape = props.data.context.selection.hoveredShape;
    if (hoverShape && shape.id === hoverShape.id) {
        hovered.value = true;
    } else {
        hovered.value = false;
    }
}
const navi_watcher = (t: number) => {
    if (t === Navi.LIST_FOLD) {
        if (!showTriangle.value || !props.data.expand) {
            return;
        }
        emits("toggleexpand", props.data.shapeview());
    } else if (t === Navi.RENAME) {
        if(props.data.selected) {
            if(props.data.context.selection.selectedShapes.length === 1) {
                onRename();
            }
        }
    }
}
onUpdated(() => {
    nextTick(current_node_radius);
    getHovered();
})
onMounted(() => {
    handlePerm()
    updater();
    props.data.context.tool.watch(tool_watcher);
    props.data.context.selection.watch(selectedWatcher);
    props.data.context.navi.watch(navi_watcher);
})
onUnmounted(() => {
    props.data.context.tool.unwatch(tool_watcher);
    oldshape && oldshape.unwatch(updater);
    props.data.context.selection.unwatch(selectedWatcher);
    props.data.context.navi.unwatch(navi_watcher);
    stop();
})
</script>

<template>
    <div ref="shapeItem"
        :class="{ container: true, selected: props.data.selected, selectedChild: selectedChild(), component: symbol_c, hovered: hovered && !props.data.selected, firstAngle: topAngle, lastAngle: bottomAngle }"
        @mousemove="hoverShape" @mouseleave="unHoverShape" @mousedown="mousedown" @mouseup="mouseup">
        <!-- 缩进 -->
        <div class="ph" :style="{ width: `${ph_width}px` }"></div>
        <!-- 开合 -->
        <div :class="{ 'is-group': is_group(), triangle: showTriangle, slot: !showTriangle }" @click="toggleExpand">
            <svg-icon v-if="showTriangle" icon-class="triangle-down" :id="props.data.expand ? 'down' : 'right'"
                :style="{ transform: props.data.expand ? 'rotate(0deg)' : 'rotate(-90deg)' }"></svg-icon>
        </div>
        <!-- icon -->
        <div class="container-svg zero-symbol" @dblclick="fitToggleContainer"
            :style="{ opacity: !visible_status ? 1 : .3 }">
            <Abbr :view="abbr_view" :shape="data.shapeview()" :icon="update_icon" :theme="symbol_c ? '#7f58f9' : '#595959'"></Abbr>
        </div>
        <!-- 内容描述 -->
        <div class="text" :style="{ display: isInput ? 'none' : '', opacity: !visible_status ? 1 : .3 }">
            <div class="txt" @dblclick="onRename">{{ get_name(props.data.shapeview(), t('compos.dlt')) }}</div>
            <div class="tool_icon" @mousedown.stop
                :style="{ visibility: `${is_tool_visible ? 'visible' : 'hidden'}`, width: `${is_tool_visible ? 66 + 'px' : lock_status || visible_status ? 66 + 'px' : 0}` }">
                <div class="tool_lock tool" @click="toggleContainer" @dblclick="fitToggleContainer">
                    <svg-icon class="svg-open" icon-class="locate"></svg-icon>
                </div>
                <div class="tool_lock tool" :class="{ 'visible': lock_status }" @click="(e: MouseEvent) => setLock(e)"
                    v-if="isEdit && !isLable">
                    <svg-icon v-if="lock_status === 0" class="svg-open" icon-class="lock-open"></svg-icon>
                    <svg-icon v-else-if="lock_status === 1" class="svg" icon-class="lock-lock"></svg-icon>
                </div>
                <div class="tool_eye tool" :class="{ 'visible': visible_status }"
                    @click="(e: MouseEvent) => setVisible(e)" v-if="isEdit && !isLable">
                    <svg-icon v-if="visible_status === 0" class="svg" icon-class="eye-open"></svg-icon>
                    <svg-icon v-else-if="visible_status === 1" class="svg" icon-class="eye-closed"></svg-icon>
                </div>
            </div>
        </div>
        <input v-if="isInput" @change="onChangeName" @click.stop class="rename" type="text" ref="nameInput">
    </div>
</template>

<style scoped lang="scss">
// 这整个样式表决定定位和计算结果,不可以轻易修改
.container {
    display: flex;
    flex-flow: row;
    align-items: center;
    width: calc(100% - 6px);
    height: 32px;
    box-sizing: border-box;

    >.ph {
        height: 100%;
        flex-shrink: 0;
        flex-grow: 0;
    }

    >.triangle {
        box-sizing: border-box;
        padding-left: 6px;
        width: 18px;
        height: 100%;
        display: flex;
        margin-right: 3px;
        align-items: center;
        justify-content: center;
        cursor: pointer;

        >svg {
            width: 12px;
            height: 12px;
        }
    }

    >.slot {
        width: 18px;
        margin-right: 3px;
        height: 100%;
    }

    >.container-svg {
        width: 14px;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-right: 3px;
    }

    >.text {
        flex: 1;
        line-height: 30px;
        font-size: var(--font-default-fontsize);
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        display: flex;
        flex-flow: row;
        align-items: center;
        width: 100%;
        height: 30px;
        color: var(--left-navi-font-color);
        background-color: transparent;

        >.txt {
            width: 100%;
            height: 30px;
            line-height: 30px;
            font-size: 12px;
            color: #262626;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
            padding-left: 2px;
        }

        >.tool_icon {
            display: flex;
            align-items: center;
            width: 66px;
            height: 100%;
            margin-left: 6px;

            >.tool {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 20px;
                height: 20px;
                margin-right: 2px;
            }

            >.tool_lock {
                display: flex;
                align-items: center;
                color: #595959;

                .svg {
                    width: 13px;
                    height: 13px;
                    color: #595959;
                }

                .svg-open {
                    width: 13px;
                    height: 13px;
                    color: #595959;
                }

                .dot {
                    width: 4px;
                    height: 4px;
                    border-radius: 50%;
                    background-color: #8C8C8C;
                }
            }

            >.tool_eye {
                margin-right: 10px;

                .svg {
                    width: 13px;
                    height: 13px;
                    color: #595959;
                }

                .dot {
                    width: 4px;
                    height: 4px;
                    border-radius: 50%;
                    background-color: var(--theme-color);
                }
            }

            .visible {
                visibility: visible;
            }
        }
    }

    >.rename {
        flex: 1;
        height: 24px;
        width: 100%;
        font-size: var(--font-default-fontsize);
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        padding-left: 6px;
        margin-right: 6px;
        outline-style: none;
        border: none;
        border-radius: 2px;
    }
}

.container:hover {
    z-index: -1;
    border-radius: 8px;
    background-color: #efefef;
}

.selectedChild {
    z-index: 2;
    border-radius: 0 !important;
    background-color: rgba($color: #1878f5, $alpha: 0.08) !important;
}

.selected {
    z-index: 1;
    border-radius: 0 !important;
    background-color: rgba($color: #1878F5, $alpha: 0.2) !important;
}

.hovered {
    border-radius: var(--default-radius);
    background-color: #efefef;
}

.component {
    color: var(--component-color);

    &>.text>.txt,
    &>.text>.tool_icon {
        color: var(--component-color);
    }
}

.firstAngle {
    border-top-left-radius: 8px !important;
    border-top-right-radius: 8px !important;
}

.lastAngle {
    border-bottom-left-radius: 8px !important;
    border-bottom-right-radius: 8px !important;
}
</style>