<!--
 * @LastEditors: Zrx georgezrx@163.com
 * @LastEditTime: 2023-03-03 14:47:46
 * @FilePath: \kcdesign\src\components\common\IconText.vue
-->
<script setup lang="ts">
import { defineProps, defineEmits, ref } from "vue";
const props = defineProps<{
    svgicon?: any,
    icon?: any,
    ticon?: string,
    text: string | number,
    frame?: { width: number, height: number, rotate?: number }
}>();
const emit = defineEmits<{
    (e: "onchange", value: string): void;
}>();

function onChange(e: Event) {
    const value = (e.currentTarget as any)['value']
    emit("onchange", value);
}
const curpt: {x: number, y: number} = {x: 0, y: 0}

const scale: {axleX: number, axleY: number, degX: number, degY: number} = {
    axleX: 0,
    axleY: 0,
    degX: 0,
    degY: 0
}
const onMouseDown = (e:MouseEvent) => {
    //鼠标按下时的位置
    curpt.x = e.pageX
    curpt.y = e.pageY
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)

}

const onMouseMove = (e: MouseEvent) => {
    //鼠标移动的距离
    const mx = e.pageX - curpt.x
    const my = e.pageY - curpt.y
    // console.log(mx,'mx');

    scale.axleX = Number((mx / 5).toFixed(2));
    scale.axleY = Number((mx / 5).toFixed(2));
    
    scale.degX = Number((mx / 10).toFixed(2))
    scale.degY = Number((mx / 10).toFixed(2));
    console.log(scale,'scale');
    
}

const onMouseUp = (e: MouseEvent) => {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)

}
</script>

<template>
<label class="icontext">
    <svg-icon
        @mousedown="onMouseDown"
        class="icon"
        v-if="props.svgicon"
        :icon-class="props.svgicon"
        :style="{
            width: `${props.frame ? frame?.width : 18}px`,
            height: `${props.frame ? frame?.height : 18}px`,
            transform: `rotate(${props.frame ? frame?.rotate : 0}deg)`
        }"
    ></svg-icon>
    <img class="icon" v-if="props.icon" :src="props.icon" />
    <span @mousedown="onMouseDown" class="icon" v-if="!props.icon && props.ticon" >{{props.ticon}}</span>
    <input :value="props.text" v-on:change="onChange"/>
</label>
</template>

<style scoped lang="scss">
.icontext {
    display: flex;
    flex-flow: row;
    white-space: nowrap;
    overflow: hidden;
    padding: 1px;
    align-items: center;
    padding: 0 8px;
    box-sizing: border-box;
    > .icon {
        color: grey;
        width: 14px;
        height: 14px;
        flex-shrink: 0;
        cursor: ew-resize;
        text-align: center;
    }
    > span {
        line-height: 14px;
    }
    > input {
        width: 100%;
        flex: 1 1 auto;
        align-content: center;
        margin-left: 2px;
        color: var(--theme-color);
        font-family: var(--font-family);
        text-overflow: ellipsis;
        background-color: transparent;
        border: none;
        outline: none;
    }
}
</style>