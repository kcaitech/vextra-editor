<script setup lang="ts">

import { defineProps, defineEmits, onBeforeMount, onBeforeUpdate, ref, computed, nextTick, InputHTMLAttributes } from "vue";
import { Shape, GroupShape } from '@kcdesign/data/data/shape';
export interface ItemData {
    id: string
    shape: Shape
    selected: boolean
    expand: boolean
    level: number
}

const isLock = ref<boolean>(true)
const isRead = ref<boolean>(true)
const isVisible = ref<boolean>(false)
const isInput = ref<boolean>(false)
const nameInput = ref<HTMLInputElement | null>(null)
const props = defineProps<{ data: ItemData }>();
const phWidth = computed(() => {
    return (props.data.level - 1) * 6;
})

const emit = defineEmits<{
    (e: "toggleexpand", shape: Shape): void;
    (e: "selectshape", data: ItemData, ctrl: boolean, meta: boolean, shift: boolean): void;
    (e: "hovershape", shape: Shape): void;
    (e: "unhovershape"): void;
    (e: "isLock", isLock: boolean): void;
    (e: "isRead", isRead: boolean): void;
    (e: "rename", name: string, shape: Shape): void;
}>();
let showTriangle = ref<boolean>(false);
function updater() {
    let shape = props.data.shape;
    showTriangle.value = shape instanceof GroupShape && shape.childs.length > 0;
}
// const { proxy } = getCurrentInstance() as ComponentInternalInstance;
function toggleExpand(e: Event) {
    if (!showTriangle.value) {
        return;
    }
    e.stopPropagation();
    emit("toggleexpand", props.data.shape);
}

const toggleContainer = (e: MouseEvent) => {
    e.stopPropagation()
    console.log(e, 'e');
}

function selectShape(e: MouseEvent) {
    e.stopPropagation();
    const { ctrlKey, metaKey, shiftKey } = e;
    emit("selectshape", props.data, ctrlKey, metaKey, shiftKey);
}

function hoverShape(e: MouseEvent) {
    e.stopPropagation();
    emit("hovershape", props.data.shape);
    isVisible.value = true
}
function unHoverShape(e: MouseEvent) {
    e.stopPropagation();
    emit("unhovershape");
    isVisible.value = false
}
const onLock = () => {
    isLock.value = !isLock.value
    emit('isLock', isLock.value)
}
const onRead = () => {
    isRead.value = !isRead.value
    emit('isRead', isRead.value)
}
const onRename = () => {
    isInput.value = true
    nextTick(() => {
        if (nameInput.value) {
            (nameInput.value as HTMLInputElement).value = props.data.shape.name;
            nameInput.value.focus();
            nameInput.value.select();
            nameInput.value?.addEventListener('blur', stopInput);
            nameInput.value?.addEventListener('keydown', keySaveInput);

        }
    })

}
const onChangeName = (e: Event) => {
    const value = (e.target as InputHTMLAttributes).value
    emit('rename', value, props.data.shape);
}

const stopInput = () => {
    isInput.value = false
}
const keySaveInput = (e: KeyboardEvent) => {
    if (e.code === 'Enter') {
        isInput.value = false       
    } else if (e.code === 'Escape') {
        isInput.value = false
    }
}

onBeforeMount(() => {
    updater();
})
onBeforeUpdate(() => {
    updater();
})

</script>

<template>
    <div :class="{ container: true, selected: props.data.selected }" @click="selectShape" @mouseover="hoverShape"
        @mouseleave="unHoverShape">
        <div class="ph" :style="{ width: `${phWidth}px`, height: '100%', minWidth: `${phWidth}px` }"></div>
        <div :class="{ triangle: showTriangle, slot: !showTriangle }" v-on:click="toggleExpand">
            <div v-if="showTriangle" :class="{ 'triangle-right': !props.data.expand, 'triangle-down': props.data.expand }">
            </div>
        </div>
        <div class="containerSvg" @dblclick="toggleContainer">
            <svg-icon class="svg" icon-class="pattern-rectangle"></svg-icon>
        </div>
        <div class="text" :class="{ container: true, selected: props.data.selected }"
            :style="{ opacity: isRead ? '' : .3, display: isInput ? 'none' : '' }">
            <div class="text" @dblclick="onRename">{{ props.data.shape.name }}</div>
            <div class="tool_icon" :style="{ visibility: `${isVisible ? 'visible' : 'hidden'}` }">
                <div class="tool_lock tool" :class="{ 'visible': !isLock }" @click="onLock">
                    <svg-icon v-if="isLock" class="svg-open" icon-class="lock-open"></svg-icon>
                    <svg-icon v-else class="svg" icon-class="lock-lock"></svg-icon>
                </div>
                <div class="tool_eye tool" :class="{ 'visible': !isRead }" @click="onRead">
                    <svg-icon v-if="isRead" class="svg" icon-class="eye-open"></svg-icon>
                    <svg-icon v-else class="svg" icon-class="eye-closed"></svg-icon>
                </div>
            </div>
        </div>
        <input v-if="isInput" @change="onChangeName" class="rename" type="text" ref="nameInput">
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

div.container:hover {
    cursor: default;
    background-color: var(--left-navi-button-hover-color);
}

div.container.selected {
    background-color: var(--left-navi-button-select-color);
}

div.ph {
    margin-left: 6px;
}

div.triangle {
    width: 8px;
    min-width: 8px;
    height: 100%;
    padding-right: 2px;
}

div.slot {
    width: 8px;
    min-width: 8px;
    height: 100%;
    padding-right: 2px;
}

div.triangle:hover {
    cursor: default;
    background-color: var(--grey-dark);
}

div.triangle-right {
    width: 0;
    height: 0;
    border-left: 5px solid gray;
    border-top: 3px solid transparent;
    border-bottom: 3px solid transparent;
    position: relative;
    left: 2px;
    top: 12px;
}

div.triangle-down {
    width: 0;
    height: 0;
    border-top: 5px solid gray;
    border-left: 3px solid transparent;
    border-right: 3px solid transparent;
    position: relative;
    left: 1px;
    top: 13px;
}

div.containerSvg {
    display: flex;
    width: 16px;
    justify-content: center;
    align-items: center;

    .svg {
        width: 10px;
        height: 10px;
    }
}

div.text {
    flex: 1;
    line-height: 30px;
    font-size: 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    padding-left: 2px;
}

div .rename {
    flex: 1;
    height: 20px;
    width: 100%;
    font-size: 10px;
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
    width: 24px;
    height: 24px;

}

.tool_icon {
    display: flex;
    align-items: center;
    margin-right: 6px;

    .tool_lock {
        .svg {
            width: 8px;
            height: 10px;
        }

        .svg-open {
            width: 16px;
            height: 16px;
        }
    }

    .tool_eye {
        margin-right: 5px;

        .svg {
            width: 16px;
            height: 16px;
        }
    }

    .visible {
        visibility: visible;
    }
}
</style>