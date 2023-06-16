<script setup lang="ts">
import { ref, nextTick, InputHTMLAttributes, onMounted, onUnmounted } from "vue";
import { Selection } from "@/context/selection";
import { Context } from "@/context";
export interface ItemData {
    name: string
    id: string
    selected: boolean
    context: Context
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
    if(value.length === 0 || value.length > 40 || value.trim().length === 0) return  
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
</script>

<template>
    <!-- pageItem匹配listview拖拽线条 -->
    <div class="pageItem" :class="{ container: true, selected: props.data.selected }" @mousedown="onMouseDown">
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