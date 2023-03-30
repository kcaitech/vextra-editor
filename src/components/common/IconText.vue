<!--
 * @LastEditors: Zrx georgezrx@163.com
 * @LastEditTime: 2023-03-03 14:47:46
 * @FilePath: \kcdesign\src\components\common\IconText.vue
-->
<script setup lang="ts">
import { defineProps, defineEmits,watch,ref } from "vue";
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
type Scale = {axleX: number, degX: number}
const scale = ref<Scale>({
    axleX: 0,
    degX: 0
})
const isDrag = ref(false)
const onMouseDown = (e:MouseEvent) => {
    isDrag.value = true
    //鼠标按下时的位置
    curpt.x = e.screenX
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)

}

const onMouseMove = (e: MouseEvent) => {
    //鼠标移动的距离
    const mx = e.screenX - curpt.x
    if(isDrag.value && mx > 4 || mx < 4) {
        curpt.x = e.screenX
    }
    // console.log(mx,'mx');
    //坐标移动的大小
    scale.value.axleX = Number((mx / 5).toFixed(2));
    //角度移动的大小
    scale.value.degX = Number((mx / 10).toFixed(2))
    
}

watch(scale, (newV, oldV) => {
    //input的值加上鼠标移动后的大小等于最终改变的值
    let result = Number(props.text)+ Number(newV.axleX)
   
    if(props.ticon) {
        let value = result 
        
        emit("onchange", value.toString());
        
    }else {
        let value = result + scale.value.degX
        emit("onchange", value.toString())
    }
    
},{deep:true})

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