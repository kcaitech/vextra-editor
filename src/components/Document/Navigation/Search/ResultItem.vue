<script setup lang="ts">
import {ref, nextTick, InputHTMLAttributes, onMounted, onUnmounted, watch} from "vue";
import {Shape, ShapeType} from '@kcdesign/data';
import {Context} from "@/context";
import {Navi} from "@/context/navigate";
import {is_parent_locked, is_parent_unvisible, is_valid_data} from "@/utils/shapelist";
import {is_state} from "@/utils/symbol";

export interface ItemData {
    id: string
    shape: Shape
    selected: boolean
    context: Context
    keywords: string
}

interface Props {
    data: ItemData
}

interface Slice {
    content: string
    isKeywords: boolean
}

const isInput = ref<boolean>(false)
const nameInput = ref<HTMLInputElement | null>(null)
const props = defineProps<Props>();
const esc = ref<boolean>(false);
const name_display = ref<Slice[]>([{content: props.data.shape.name, isKeywords: false}]);
const reflush = ref<number>(0);
const lock_status = ref<number>(0) // 1：锁 2：继承锁 -1：不锁
const visible_status = ref<number>(1) // 1：隐藏 2： 继承隐藏 -1：显示
const is_tool_visible = ref<boolean>()
const emit = defineEmits<{
    (e: "toggleexpand", shape: Shape): void;
    (e: "selectshape", shape: Shape, ctrl: boolean, meta: boolean, shift: boolean): void;
    (e: "hovershape", shape: Shape): void;
    (e: "unhovershape"): void;
    (e: "isLock", isLock: boolean, shape: Shape): void;
    (e: "isRead", isRead: boolean, shape: Shape): void;
    (e: "rename", name: string, shape: Shape, event?: KeyboardEvent): void;
    (e: "scrolltoview", shape: Shape): void;
    (e: "item-mousedown", event: MouseEvent, shape: Shape): void;
}>();
const watchedShapes = new Map();

function watchShapes() {
    const needWatchShapes = new Map();
    let shape = props.data.shape;
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

const stop = watch(() => props.data.shape, (value, old) => {
    old && old.unwatch(updater);
    value.watch(updater);
    watchShapes();
}, {immediate: true})

function updater(t?: any) {
    if (t === 'shape-frame') return;
    lock_status.value = props.data.shape.isLocked ? 1 : 0;
    visible_status.value = props.data.shape.isVisible ? 0 : 1;
    if (is_parent_locked(props.data.shape)) {
        lock_status.value = 2;
    }
    if (is_parent_unvisible(props.data.shape)) {
        visible_status.value = 2;
    }
}

const toggleContainer = (e: MouseEvent) => {
    e.stopPropagation()
    if (!is_valid_data(props.data.context, props.data.shape)) return;
    emit('scrolltoview', props.data.shape);
}

function selectShape(e: MouseEvent) {
    e.stopPropagation();
    const {ctrlKey, metaKey, shiftKey} = e;
    if (!is_valid_data(props.data.context, props.data.shape)) return;
    emit("selectshape", props.data.shape, ctrlKey, metaKey, shiftKey);
}

function hoverShape(e: MouseEvent) {
    if (!is_valid_data(props.data.context, props.data.shape)) return;
    const working = !props.data.context.workspace.isTranslating;
    if (working) {
        is_tool_visible.value = true;
    }
}

function unHoverShape(e: MouseEvent) {
    if (!is_valid_data(props.data.context, props.data.shape)) return;
    e.stopPropagation();
    is_tool_visible.value = false
}

const onRename = () => {
    if (is_state(props.data.shape)
        || props.data.context.tool.isLable
        || props.data.shape.isVirtualShape) return;
    isInput.value = true
    nextTick(() => {
        if (nameInput.value) {
            (nameInput.value as HTMLInputElement).value = props.data.shape.name.trim();
            nameInput.value.focus();
            nameInput.value.select();
            nameInput.value?.addEventListener('blur', stopInput);
            nameInput.value?.addEventListener('keydown', keySaveInput);
        }
    })
    document.addEventListener('click', onInputBlur);
}
const onChangeName = (e: Event) => {
    if (!is_valid_data(props.data.context, props.data.shape)) return;
    const value = (e.target as InputHTMLAttributes).value
    if (esc.value) return
    if (value.length === 0 || value.length > 40 || value.trim().length === 0) return
    emit('rename', value, props.data.shape);
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
        }, 30)
    }
}
const selectedChild = () => {
    let parent = props.data.shape.parent
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
const mousedown = (e: MouseEvent) => {
    if (!is_valid_data(props.data.context, props.data.shape)) return;
    e.stopPropagation();
    emit('item-mousedown', e, props.data.shape)
    selectedChild();
}

function update_slice() {
    name_display.value = [];
    const src = props.data.shape.name;
    const word = props.data.keywords;
    const is_acc = props.data.context.navi.accurate ? 'mg' : 'img';
    const reg = new RegExp(`${word}`, is_acc);
    const index = src.search(reg);
    name_display.value.push({
            isKeywords: false,
            content: src.slice(0, index)
        }, {
            isKeywords: true,
            content: src.slice(index, index + word.length),
        }, {
            isKeywords: false,
            content: src.slice(index + word.length),
        }
    )
    reflush.value++;
}

function navi_watcher(t: number) {
    if (t === Navi.SEARCHING) update_slice();
}

const setLock = (e: MouseEvent) => {
    e.stopPropagation();
    if (lock_status.value === 2) return; // 继承锁
    const shape = props.data.shape;
    const editor = props.data.context.editor4Shape(shape);
    editor.toggleLock();
}
const setVisible = (e: MouseEvent) => {
    e.stopPropagation();
    if (visible_status.value === 2) return; // 继承隐藏
    const shape = props.data.shape;
    const editor = props.data.context.editor4Shape(shape);
    editor.toggleVisible();
}

onMounted(() => {
    updater();
    update_slice();
    props.data.context.navi.watch(navi_watcher);
})
onUnmounted(() => {
    props.data.context.navi.unwatch(navi_watcher);
    stop()
})
</script>

<template>
    <div class="contain" :class="{ container: true, selected: false, selectedChild: selectedChild() }"
         @click="selectShape"
         @mousemove="hoverShape" @mouseleave="unHoverShape" @mousedown="mousedown">
        <div class="container-svg" @dblclick="toggleContainer">
            <svg-icon class="svg" :icon-class="`pattern-${props.data.shape.type}`"></svg-icon>
        </div>
        <div class="text" :class="{ container: true, selected: false }"
             :style="{ opacity: !visible_status ? 1 : .3, display: isInput ? 'none' : '' }">
            <div class="txt" @dblclick="onRename">
        <span v-for="(item, index) in name_display" :key="index" :class="{ active: item.isKeywords }"
              :reflush="reflush">{{
                item.content
            }}</span>
            </div>
            <div class="tool_icon"
                 :style="{ visibility: `${is_tool_visible ? 'visible' : 'hidden'}`, width: `${is_tool_visible ? 66 + 'px' : lock_status || visible_status ? 66 + 'px' : 0}` }">
                <div class="tool_lock tool" :class="{ 'visible': lock_status }" @click="(e: MouseEvent) => setLock(e)">
                    <svg-icon v-if="lock_status === 0" class="svg-open" icon-class="lock-open"></svg-icon>
                    <svg-icon v-else-if="lock_status === 1" class="svg" icon-class="lock-lock"></svg-icon>
                    <div class="dot" v-else-if="lock_status === 2"></div>
                </div>
                <div class="tool_lock tool" @click="toggleContainer">
                    <svg-icon class="svg-open" icon-class="locate"></svg-icon>
                </div>
                <div class="tool_eye tool" :class="{ 'visible': visible_status }"
                     @click="(e: MouseEvent) => setVisible(e)">
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
div.container {
    display: flex;
    flex-flow: row;
    align-items: center;
    width: 100%;
    height: 30px;
    color: var(--left-navi-font-color);
    background-color: var(--left-navi-bg-color);
}

.contain:hover {
    cursor: default;
    background-color: var(--left-navi-button-hover-color);
}

div.container.selectedChild {
    z-index: 2;
    background-color: var(--left-navi-button-hover-color);
}

div.container.selected {
    z-index: 1;
    background-color: var(--left-navi-button-select-color);
}

div.slot {
    width: 15px;
    min-width: 15px;
    height: 100%;
}

div.container-svg {
    display: flex;
    width: 10px;
    justify-content: center;
    align-items: center;
    margin-left: 13px;

    .svg {
        width: 10px;
        height: 10px;
    }
}

div.text {
    flex: 1;
    line-height: 30px;
    font-size: var(--font-default-fontsize);
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    padding-left: 2px;
    background-color: transparent;

    .txt {
        width: 100%;
        height: 30px;
        line-height: 30px;
        font-size: var(--font-default-fontsize);
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        padding-left: 2px;

        .active {
            color: var(--active-color);
        }
    }
}

div .rename {
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

.tool {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    margin-right: 2px;
}

.tool_icon {
    display: flex;
    align-items: center;
    width: 66px;
    height: 100%;

    .tool_lock {
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

    .tool_eye {
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
</style>