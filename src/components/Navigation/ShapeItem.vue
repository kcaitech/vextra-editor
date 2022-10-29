<script setup lang="ts">
import { ComponentInternalInstance, defineProps, getCurrentInstance, onBeforeMount, onBeforeUpdate, ref } from "vue";
import { Shape, GroupShape } from '@/data/shape';

export interface ItemData {
    id: string,
    shape: Shape
    selected: boolean
    expand: boolean
    level: number
}

const props = defineProps<{ data: ItemData }>();
let showTriangle = ref<boolean>(false);
function updater() {
    let shape = props.data.shape;
    showTriangle.value = shape instanceof GroupShape && shape.childsCount > 0;
}

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
function toggleExpand(e: Event) {
    if (!showTriangle.value) {
        return;
    }
    e.stopPropagation();
    proxy?.$emit("toggleexpand", props.data.shape);
}

function selectShape(e: Event) {
    e.stopPropagation();
    proxy?.$emit("selectshape", props.data.shape);
}

onBeforeMount(() => {
    updater();
})
onBeforeUpdate(() => {
    updater();
})

</script>

<template>
    <div :class="{ container: true, selected: props.data.selected }" :style="{'padding-left': '' + ((props.data.level - 1)*6) + 'px'}"
    v-on:click="selectShape">
        <div :class="{ triangle: showTriangle, slot: !showTriangle }" v-on:click="toggleExpand">
            <div v-if="showTriangle"
                :class="{'triangle-right': !props.data.expand, 'triangle-down': props.data.expand}"></div>
        </div>
        <div class="text">{{props.data.shape.name}}</div>
    </div>
</template>

<style scoped>
div.container {
    display: flex;
    flex-flow: row;
    width: 100px;
    height: 30px;
    color: var(--left-navi-font-color);
    background-color: var(--left-navi-bg-color);
}

div.container:hover {
    cursor: default;
    background-color: var(--left-navi-button-hover-color);
}

div.container.selected {
    background-color: var(--left-navi-button-hover-color);
}

div.triangle {
    width: 8px;
    height: 100%;
    padding-right: 3px;
}

div.slot {
    width: 8px;
    height: 100%;
    padding-right: 3px;
}

div.triangle:hover {
    cursor: default;
    background-color: var(--theme-color3);
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
    left: 2px;
    top: 12px;
}

div.text {
    line-height: 30px;
    font-size: 10px;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    padding-left: 2px;
}
</style>