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
import { ref, nextTick, InputHTMLAttributes, onMounted, onUnmounted } from "vue";
import { Selection } from "@/context/selection";
import { Context } from "@/context";
export interface ItemData {
    name: string
    id: string
    selected: boolean
    context: Context
    rightTarget: boolean
}
const props = defineProps<{ data: ItemData }>();
const emit = defineEmits<{
    (e: "switchpage", id: string): void;
    (e: "rename", name: string, id: string): void;
    (e: "onMouseDown", id: string, event: MouseEvent): void;
}>();
const isInput = ref<boolean>(false)
const nameInput = ref<HTMLInputElement>()
const esc = ref<boolean>(false)
const MOUSE_LEFT = 0;
const pageItem = ref<HTMLDivElement>();
function onMouseDown(e: MouseEvent) {
    e.stopPropagation();
    if (e.button === MOUSE_LEFT) {
        document.addEventListener("mouseup", function onMouseUp() {
            e.stopPropagation();
            emit("switchpage", props.data.id);
            document.removeEventListener('mouseup', onMouseUp)
        });
    }
    emit('onMouseDown', props.data.id, e)
}

const onRename = () => {
    if (props.data.context.readonly) return;
    if (props.data.context.tool.isLable) return;
    isInput.value = true
    nextTick(() => {
        if (nameInput.value) {
            (nameInput.value as HTMLInputElement).value = props.data.name.trim();
            nameInput.value.focus();
            nameInput.value.select();
            nameInput.value?.addEventListener('keydown', keySaveInput);
            nameInput.value?.addEventListener('blur', saveInput);
        }
    })
    document.addEventListener('click', onInputBlur);
}
const onChangeName = (e: Event) => {
    const value = (e.target as InputHTMLAttributes).value
    if (esc.value) return
    if (value.length === 0 || value.length > 40 || value.trim().length === 0) return
    emit('rename', value, props.data.id);
}
const saveInput = () => {
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
        if (nameInput.value) {
            nameInput.value.blur();
        }
        document.removeEventListener('click', onInputBlur);
    }
}

function update(t: number, id?: string) {
    if (t === Selection.CHANGE_RENAME && id === props.data.id) {
        onRename();
    }
}
onMounted(() => {
    props.data.context.selection.watch(update)
});
onUnmounted(() => {
    props.data.context.selection.unwatch(update)
});
import SvgIcon from '@/components/common/SvgIcon.vue';
import page_select_icon from '@/assets/icons/svg/page-select.svg';
</script>

<template>
    <div class="pageItem" ref="pageItem"
        :class="{ container: true, 'right-target': props.data.rightTarget && !props.data.selected, select: isInput }"
        @mousedown="onMouseDown">
        <div class="ph">
            <SvgIcon v-if="props.data.selected" :icon="page_select_icon"/>
        </div>
        <div class="item zero-symbol">
            <div class="title" @dblclick="onRename" :class="{ selected: props.data.selected }"
                :style="{ display: isInput ? 'none' : '' }">{{ props.data.name }}</div>
            <input v-if="isInput" class="rename" @mousedown.stop @change="onChangeName" type="text" ref="nameInput">
        </div>
    </div>
</template>

<style scoped lang="scss">
.container {
    height: 32px;
    width: calc(100% - 6px);
    line-height: 32px;
    font-weight: 500;
    color: var(--left-font-color);
    background-color: var(--left-navi-bg-color);
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: visible;
    display: flex;
    flex-direction: row;
    position: relative;
    border-radius: var(--default-radius);
    transition: 0.08s;

    .item {
        display: flex;
        align-items: center;
        width: calc(100% - 46px);
        position: relative;

        >.title {
            width: 100%;
            height: 100%;
            font-size: 12px;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
        }
    }
}

div.container:hover {
    cursor: default;
    background-color: #efefef;
}

div.container.right-target {
    background-color: var(--left-navi-button-hover-color);
}

.ph {
    padding-left: 15px;
    box-sizing: border-box;
    width: 40px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    >svg {
        width: 12px;
        height: 12px;
    }
}

div .rename {
    flex: 1;
    width: 100%;
    height: 24px;
    font-size: var(--font-default-fontsize);
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    padding-left: 6px;
    border: none;
    outline: none;
    border-radius: 2px;
}

.items-wrap {
    padding: 0 10px;

    &:hover {
        background-color: var(--active-color);
    }
}

.selected {
    color: #000;
}

.select {
    background-color: rgba($color: #1878F5, $alpha: 0.2) !important;
}
</style>