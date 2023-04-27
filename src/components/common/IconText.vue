<!--
 * @LastEditors: Zrx georgezrx@163.com
 * @LastEditTime: 2023-03-03 14:47:46
 * @FilePath: \kcdesign\src\components\common\IconText.vue
-->
<script setup lang="ts">
import { defineProps, defineEmits, watch, ref, nextTick } from "vue";
type Scale = { axleX: number, degX: number }
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
const curpt: { x: number, y: number } = { x: 0, y: 0 }
const scale = ref<Scale>({
    axleX: 0,
    degX: 0
})
const result = ref<number | string>(props.text)
const isDrag = ref(false)
const input = ref<HTMLInputElement>();

function onChange(e: Event) {
    const value = (e.currentTarget as any)['value']
    emit("onchange", value);
}
const onBlur = (e: MouseEvent) => {
    document.addEventListener('click', onBlur)
    if (e.target instanceof Element && !e.target.closest('.icontext')) {
        var timer = setTimeout(() => {
            if (input.value) {
                (input.value).blur()
            }
            clearTimeout(timer)
            document.removeEventListener('click', onBlur);
        }, 10)
    }
}
const onKeyBlur = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
        if (input.value) {
            (e.currentTarget as HTMLInputElement).blur()
        }
    }
}
const onMouseDown = (e: MouseEvent) => {
    isDrag.value = true
    //鼠标按下时的位置
    curpt.x = e.screenX
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)

}

const onMouseMove = (e: MouseEvent) => {
    //鼠标移动的距离
    let mx = e.screenX - curpt.x
    if (isDrag.value && mx > 4 || mx < -4) {
        curpt.x = e.screenX
    }
    //坐标移动的大小
    scale.value.axleX = scale.value.axleX + Number((mx / 2).toFixed(2));
    //角度移动的大小
    scale.value.degX = scale.value.degX + Number((mx / 10).toFixed(2))
    result.value = Number(parseFloat(props.text as string)) + scale.value.axleX
}
const onMouseUp = (e: MouseEvent) => {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)

}

watch(scale, () => {
    //input的值加上鼠标移动后的大小等于最终改变的值
    if (props.ticon) {
        emit("onchange", result.value.toString());
    } else {
        const value = Number(parseFloat(props.text as string)) + scale.value.degX
        emit("onchange", value.toString())
    }
}, { deep: true });
</script>

<template>
    <label class="icontext">
        <svg-icon @mousedown="onMouseDown" class="icon" v-if="props.svgicon" :icon-class="props.svgicon" :style="{
                width: `${props.frame ? frame?.width : 18}px`,
                height: `${props.frame ? frame?.height : 18}px`,
                transform: `rotate(${props.frame ? frame?.rotate : 0}deg)`
            }"></svg-icon>
        <img class="icon" v-if="props.icon" :src="props.icon" />
        <span @mousedown="onMouseDown" class="icon" v-if="!props.icon && props.ticon">{{ props.ticon }}</span>
        <input ref="input" @click="onBlur" :value="props.text" @keydown="onKeyBlur" v-on:change="onChange" />
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

    >.icon {
        color: grey;
        width: 14px;
        height: 14px;
        flex-shrink: 0;
        cursor: ew-resize;
        text-align: center;
    }

    >span {
        line-height: 14px;
    }

    >input {
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