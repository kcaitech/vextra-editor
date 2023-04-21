<!--
 * @LastEditors: Zrx georgezrx@163.com
 * @LastEditTime: 2023-03-08 09:53:56
 * @FilePath: \kcdesign\src\components\Document\Navigation\PageItem.vue
-->
<script setup lang="ts">
import { defineProps, defineEmits, ref, nextTick, InputHTMLAttributes, onMounted, onUnmounted } from "vue";
export interface ItemData {
    name: string
    id: string
    selected: boolean
}
const props = defineProps<{ data: ItemData }>();
const emit = defineEmits<{
    (e: "switchpage", id: string): void;
    (e: "rename", name: string, event?: KeyboardEvent): void;
    (e: "onMouseDown", id:string, event: MouseEvent): void;
}>();
const isInput = ref<boolean>(false)
const nameInput = ref<HTMLInputElement>()
const esc = ref<boolean>(false)
const MOUSE_LEFT = 0;
const MOUSE_RIGHT = 2;
function onMouseDown(e: MouseEvent) {
    e.stopPropagation();

    if (e.button === MOUSE_LEFT) {
        document.addEventListener("mouseup", function onMouseUp() {
            e.stopPropagation();
            emit("switchpage", props.data.id);
            document.removeEventListener('mouseup', onMouseUp)
        });
    }else if(e.button === MOUSE_RIGHT) {
        emit('onMouseDown', props.data.id,e)
    }
}

const onRename = (e: MouseEvent) => {
    isInput.value = true
    e.stopPropagation()
    nextTick(() => {
        if (nameInput.value) {
            (nameInput.value as HTMLInputElement).value = props.data.name;
            nameInput.value.focus();
            nameInput.value.select();
            nameInput.value?.addEventListener('blur', saveInput);
            nameInput.value?.addEventListener('keydown', keySaveInput);
        }
    })
    document.addEventListener('click', onInputBlur)
}
const onChangeName = (e: Event) => {
    const value = (e.target as InputHTMLAttributes).value
    if (esc.value) return
    emit('rename', value);
}
const saveInput = () => {
    esc.value = false
    isInput.value = false
}
const keySaveInput = (e: KeyboardEvent) => {
    if (e.code === 'Enter') {
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

// function pageMenuUnmount(e?: MouseEvent, item?: string) {
//     pageMenu.value = false;
//     if(item === 'rename') {
//         e?.stopPropagation()
//         onRename(e!)
//     }
// }
onMounted(() => {});
onUnmounted(() => {});
</script>

<template>
    <div :class="{ container: true, selected: props.data.selected }" @mousedown="onMouseDown">
        <div class="ph"></div>
        <div class="item">
            <div class="title" @dblclick="onRename" :style="{ display: isInput ? 'none' : '' }">{{ props.data.name }}</div>
            <input v-if="isInput" class="rename" @change="onChangeName" type="text" ref="nameInput">
        </div>
    </div>
</template>

<style scoped lang="scss">
.container {
    width: 100%;
    height: 30px;
    line-height: 30px;
    color: var(--left-navi-font-color);
    background-color: var(--left-navi-bg-color);
    font-size: 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: visible;
    display: flex;
    flex-direction: row;
    position: relative;

    .item {
        display: flex;
        align-items: center;
        width: 100%;
        position: relative;

        >.title {
            width: 100%;
            height: 100%;
            font-size: 10px;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
        }
    }
}

div.container:hover {
    cursor: default;
    background-color: var(--left-navi-button-hover-color);
}

div.container.selected {
    background-color: var(--left-navi-button-select-color);
}

.ph {
    width: 13px;
    min-width: 13px;
    height: 100%;
}

div .rename {
    flex: 1;
    width: 100%;
    height: 22px;
    font-size: 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    padding-left: 6px;
    margin-right: 6px;
    outline-style: none;
    border: 1px solid var(--left-navi-button-select-color);
}

.items-wrap {
    padding: 0 10px;

    &:hover {
        background-color: var(--active-color);
    }
}
</style>