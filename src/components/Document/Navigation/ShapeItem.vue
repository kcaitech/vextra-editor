<script setup lang="ts">
import { ref, computed, nextTick, InputHTMLAttributes, watch, onUnmounted, onMounted } from "vue";
import { Shape, ShapeType } from '@kcdesign/data';
import { Context } from "@/context";
import {get_name, is_parent_locked, is_parent_unvisible} from "@/utils/shapelist";
import { Perm } from "@/context/workspace";
import { XYsBounding } from "@/utils/common";
import { Tool } from "@/context/tool";
export interface ItemData {
    id: string
    shape: () => Shape // 作用function，防止vue对shape内部数据进行proxy
    selected: boolean
    expand: boolean
    level: number
    context: Context
}
interface Props {
    data: ItemData
}
const lock_status = ref<number>(0) // 1：锁 2：继承锁 -1：不锁
const visible_status = ref<number>(1) // 1：隐藏 2： 继承隐藏 -1：显示
const is_tool_visible = ref<boolean>()
const isInput = ref<boolean>(false)
const nameInput = ref<HTMLInputElement | null>(null)
const props = defineProps<Props>();
const esc = ref<boolean>(false)
const isread = ref(false)
const canComment = ref(false)
const isEdit = ref(false)
const ph_width = computed(() => (props.data.level - 1) * 10);
const emit = defineEmits<{
    (e: "toggleexpand", shape: Shape): void;
    (e: "selectshape", shape: Shape, ctrl: boolean, meta: boolean, shift: boolean): void;
    (e: "hovershape", shape: Shape): void;
    (e: "unhovershape"): void;
    (e: "set-lock", shape: Shape): void;
    (e: "set-visible", val: boolean, shape: Shape): void;
    (e: "rename", name: string, shape: Shape, event?: KeyboardEvent): void;
    (e: "scrolltoview", shape: Shape): void;
    (e: "item-mousedown", event: MouseEvent, shape: Shape): void;
}>();
let showTriangle = ref<boolean>(false);
const watchedShapes = new Map();
function watchShapes() {
    const needWatchShapes = new Map();
    let shape = props.data.shape();
    let p = shape.parent;
    while (p && p.type !== ShapeType.Page) {
        needWatchShapes.set(p.id, p);
        p = p.parent;
    }
    watchedShapes.forEach((v, k) => {
        if (needWatchShapes.has(k)) return;
        v.unwatch(updater);
        watchedShapes.delete(k);
    })
    needWatchShapes.forEach((v, k) => {
        if (watchedShapes.has(k)) return;
        v.watch(updater);
        watchedShapes.set(k, v);
    })
}
const stop = watch(() => props.data.shape(), (value, old) => {
    old && old.unwatch(updater);
    value.watch(updater);
    watchShapes();
}, { immediate: true })
function updater(t?: any) {
    if (t === 'shape-frame') return;
    const shape = props.data.shape();
    const naviChilds = shape.naviChilds;
    showTriangle.value = Boolean(naviChilds && naviChilds.length > 0);
    lock_status.value = shape.isLocked ? 1 : 0;
    visible_status.value = shape.getVisible() ? 0 : 1;
    if (is_parent_locked(shape)) lock_status.value = 2;
    if (is_parent_unvisible(shape)) visible_status.value = 2;
}

function toggleExpand(e: Event) {
    if (!showTriangle.value) return;
    e.stopPropagation();
    emit("toggleexpand", props.data.shape());
}

const toggleContainer = (e: MouseEvent) => {
    e.stopPropagation()
    emit('scrolltoview', props.data.shape());
}

function selectShape(e: MouseEvent) {
    e.stopPropagation();
    const { ctrlKey, metaKey, shiftKey } = e;
    emit("selectshape", props.data.shape(), ctrlKey, metaKey, shiftKey);
}

function hoverShape(e: MouseEvent) {
    const working = !props.data.context.workspace.isTranslating;
    if (working) {
        emit("hovershape", props.data.shape());
        is_tool_visible.value = true;
    }
}
function unHoverShape(e: MouseEvent) {
    e.stopPropagation();
    emit("unhovershape");
    is_tool_visible.value = false
}
const setLock = (e: MouseEvent) => {
    if (lock_status.value === 2) return; // 继承锁
    e.stopPropagation();
    emit('set-lock', props.data.shape())
}
const setVisible = (e: MouseEvent) => {
    if (visible_status.value === 2) return; // 继承隐藏
    e.stopPropagation();
    emit('set-visible', Boolean(visible_status.value < 0), props.data.shape())
}
const onRename = () => {
    if (!isEdit.value) return;
    if(props.data.context.tool.isLable) return;
    isInput.value = true
    nextTick(() => {
        if (nameInput.value) {
            (nameInput.value as HTMLInputElement).value = props.data.shape().name.trim();
            nameInput.value.focus();
            nameInput.value.select();
            nameInput.value?.addEventListener('blur', stopInput);
            nameInput.value?.addEventListener('keydown', keySaveInput);
        }
    })
    document.addEventListener('click', onInputBlur)
}
const onChangeName = (e: Event) => {
    const value = (e.target as InputHTMLAttributes).value
    if (esc.value) return
    if (value.length === 0 || value.length > 40 || value.trim().length === 0) return
    emit('rename', value, props.data.shape());
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
                (nameInput.value).blur()
            }
            clearTimeout(timer)
            document.removeEventListener('click', onInputBlur);
        }, 10)
    }
}
const selectedChild = () => {
    let parent = props.data.shape().parent
    let child
    while (parent) {
        if (parent.type === 'page') break
        child = props.data.context.selection.isSelectedShape(parent)
        parent = parent.parent
        if (child) {
            return child
        }
    }
    return child
}
function is_component() {
    let s: any = props.data.shape();
    while (s) {
        if (s.type === ShapeType.Page) return false;
        if (s.type === ShapeType.SymbolRef) return true;
        if (s.type === ShapeType.Symbol) return true;
        s = s.parent;
    }
}
const mousedown = (e: MouseEvent) => {
    e.stopPropagation();
    emit('item-mousedown', e, props.data.shape())
    selectedChild();
}

//获取文档权限
const hangdlePerm = () => {
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
function icon_class() {
    const shape = props.data.shape();
    if (shape.type === ShapeType.Symbol) {
        if (shape.isUnionSymbolShape) {
            return 'pattern-symbol-union';
        } else {
            return 'pattern-component';
        }
    } else {
        return `pattern-${shape.type}`;
    }
}
const isLable = ref(props.data.context.tool.isLable);
const tool_watcher = (t?: number) => {
    if(t === Tool.LABLE_CHANGE) {
        isLable.value = props.data.context.tool.isLable;
    }
}
onMounted(() => {
    hangdlePerm()
    updater();
    props.data.context.tool.watch(tool_watcher);
    // init_d();
})
onUnmounted(() => {
    props.data.context.tool.watch(tool_watcher);
    stop();
})
</script>

<template>
    <div :class="{ container: true, selected: props.data.selected, selectedChild: selectedChild(), component: is_component() }"
        @click="selectShape" @mousemove="hoverShape" @mouseleave="unHoverShape" @mousedown="mousedown">
        <div class="ph" :style="{ width: `${ph_width}px`, height: '100%', minWidth: `${ph_width}px` }"></div>
        <div :class="{ triangle: showTriangle, slot: !showTriangle }" @click="toggleExpand">
            <div v-if="showTriangle" :class="props.data.expand ? 'triangle-down' : 'triangle-right'">
            </div>
        </div>
        <div class="container-svg" @dblclick="toggleContainer">
            <svg-icon class="svg" :icon-class="icon_class()"></svg-icon>
        </div>
        <div class="text" :style="{ opacity: !visible_status ? 1 : .3, display: isInput ? 'none' : '' }">
            <div class="txt" @dblclick="onRename">{{ get_name(props.data.shape()) }}</div>
            <div class="tool_icon"
                :style="{ visibility: `${is_tool_visible ? 'visible' : 'hidden'}`, width: `${is_tool_visible ? 66 + 'px' : lock_status || visible_status ? 66 + 'px' : 0}` }">
                <div class="tool_lock tool" :class="{ 'visible': lock_status }" @click="(e: MouseEvent) => setLock(e)"
                    v-if="isEdit && !isLable">
                    <svg-icon v-if="lock_status === 0" class="svg-open" icon-class="lock-open"></svg-icon>
                    <svg-icon v-else-if="lock_status === 1" class="svg" icon-class="lock-lock"></svg-icon>
                    <div class="dot" v-else-if="lock_status === 2"></div>
                </div>
                <div class="tool_lock tool" @click="toggleContainer">
                    <svg-icon class="svg-open" icon-class="locate"></svg-icon>
                </div>
                <div class="tool_eye tool" :class="{ 'visible': visible_status }" @click="(e: MouseEvent) => setVisible(e)"
                    v-if="isEdit && !isLable">
                    <svg-icon v-if="visible_status === 0" class="svg" icon-class="eye-open"></svg-icon>
                    <svg-icon v-else-if="visible_status === 1" class="svg" icon-class="eye-closed"></svg-icon>
                    <div class="dot" v-else-if="visible_status === 2"></div>
                </div>
            </div>
        </div>
        <input v-if="isInput" @change="onChangeName" @click.stop class="rename" type="text" ref="nameInput">
    </div>
</template>

<style scoped lang="scss">
.container {
    display: flex;
    flex-flow: row;
    align-items: center;
    margin-left: 6px;
    height: 30px;
    width: calc(100% - 12px);
    height: 30px;
    box-sizing: border-box;

    >.ph {
        margin-left: 6px;
    }

    >.triangle {
        width: 12px;
        min-width: 12px;
        height: 100%;
        display: flex;
        justify-content: center;

        >.triangle-right {
            width: 0;
            height: 0;
            border-left: 5px solid gray;
            border-top: 3px solid transparent;
            border-bottom: 3px solid transparent;
            position: relative;
            left: 2px;
            top: 12px;
        }

        >.triangle-down {
            width: 0;
            height: 0;
            border-top: 5px solid gray;
            border-left: 3px solid transparent;
            border-right: 3px solid transparent;
            position: relative;
            left: 1px;
            top: 13px;
        }
    }

    >.slot {
        width: 15px;
        min-width: 15px;
        height: 100%;
    }

    >.container-svg {
        display: flex;
        width: 10px;
        height: 10px;
        justify-content: center;
        align-items: center;
        margin-left: 2px;

        .svg {
            width: 10px;
            height: 10px;
        }
    }

    >.text {
        flex: 1;
        line-height: 30px;
        font-size: var(--font-default-fontsize);
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        padding-left: 2px;
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
            font-size: var(--font-default-fontsize);
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

                .svg {
                    width: 8px;
                    height: 10px;
                }

                .svg-open {
                    width: 14px;
                    height: 14px;
                }

                .dot {
                    width: 4px;
                    height: 4px;
                    border-radius: 50%;
                    background-color: var(--theme-color);
                }
            }

            >.tool_eye {
                margin-right: 10px;

                .svg {
                    width: 14px;
                    height: 14px;
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
        height: 20px;
        width: 100%;
        font-size: var(--font-default-fontsize);
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        padding-left: 6px;
        margin-right: 6px;
        outline-style: none;
        border: 1px solid var(--left-navi-bg-color);
    }
}

.container:hover {
    border-radius: 4px;
    background-color: var(--left-navi-button-hover-color);
}

.selectedChild {
    z-index: 2;
    border-radius: 0px !important;
    background-color: rgba($color: #865dff, $alpha: 0.18) !important;
}

.selected {
    z-index: 1;
    border-radius: 0px !important;
    background-color: rgba($color: #865dff, $alpha: 0.4) !important;
}

.component {
    color: var(--component-color);

    &>.text>.txt,
    &>.text>.tool_icon {
        color: var(--component-color);
    }
}
</style>