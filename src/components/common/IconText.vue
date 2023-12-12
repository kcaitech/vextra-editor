<script setup lang="ts">
import { Context } from "@/context";
import { get_rotation } from "@/utils/attri_setting";
import { watch, ref, onMounted } from "vue";
type Scale = { axleX: number, degX: number }
const props = defineProps<{
    svgicon?: any,
    icon?: any,
    ticon?: string,
    text: string | number,
    frame?: { width: number, height: number, rotate?: number },
    multipleValues?: boolean
    disabled?: boolean
    context: Context
}>();
const emit = defineEmits<{
    (e: "onchange", value: string): void;
}>();
const curpt: { x: number, y: number } = { x: 0, y: 0 }
const _curpt: { x: number, y: number } = { x: 0, y: 0 }
const screenWidth = ref(window.innerWidth)
const screenHeight = ref(window.innerHeight)
const scale = ref<Scale>({
    axleX: 0,
    degX: 0
})
const isDrag = ref(false)
const input = ref<HTMLInputElement>();

function onChange(e: Event) {
    if (props.disabled) return;
    let value = (e.currentTarget as any)['value']
    try {
        if (props.svgicon == 'angle' && input.value!.value.slice(-1) === '°') {
            const raduis = input.value!.value.slice(0, -1)
            value = eval(raduis);
            input.value!.value = value
        } else {
            value = eval(value);
            input.value!.value = value
        }
    } catch (error) {
        return input.value!.value = String(props.text)
    }
    if (props.svgicon !== 'angle') {
        if (isNaN(Number(input.value!.value))) {
            return input.value!.value = String(props.text)
        }
    } else if (props.svgicon === 'angle') {
        if (input.value!.value.slice(-1) !== '°' && isNaN(Number(input.value!.value))) {
            return input.value!.value = String(props.text)
        }
    }
    if (Number(input.value!.value) < 1 && props.ticon === 'W') {
        input.value!.value = '1'
    } else if (Number(input.value!.value) < 1 && props.ticon === 'H') {
        input.value!.value = '1'
    }
    if (value < 1 && props.ticon === 'W') {
        value = 1
    } else if (value < 1 && props.ticon === 'H') {
        value = 1
    }
    emit("onchange", value);
}
const onBlur = (e: MouseEvent) => {
    if (props.disabled) return;
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
    if (props.disabled) return;
    if (e.key === 'Enter') {
        if (input.value) {
            (e.currentTarget as HTMLInputElement).blur()
        }
    }
}
const onMouseDown = (e: MouseEvent) => {
    return; // 关闭拖动设值
    // if (props.disabled) return;
    // if (props.svgicon === 'radius' && props.multipleValues === true) {
    //     return
    // }
    // isDrag.value = true
    // //鼠标按下时的位置
    // curpt.x = e.screenX
    // document.addEventListener('mousemove', onMouseMove)
    // document.addEventListener('mouseup', onMouseUp)
}
const onMouseMove = (e: MouseEvent) => {
    //鼠标移动的距离
    let mx = e.screenX - curpt.x
    if (isDrag.value && mx > 4 || mx < -4) {
        curpt.x = e.screenX
    }
    //坐标移动的大小
    scale.value.axleX = Number((mx).toFixed(2))
    //角度移动的大小
    scale.value.degX = Number((mx / 5).toFixed(2))
}
const onMouseUp = (e: MouseEvent) => {
    isDrag.value = false;
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)

}

const selectValue = () => {
    if (input.value) {
        input.value.select()
    }
}

watch(scale, () => {
    //input的值加上鼠标移动后的大小等于最终改变的值
    if (props.ticon) {
        const shapes = props.context.selection.selectedShapes;
        if(shapes.length === 1) {
            input.value!.value = String(Number(input.value!.value) + scale.value.axleX)
            if (props.ticon === 'W' || props.ticon === 'H') {
                if (Number(input.value!.value) < 1) {
                    input.value!.value = '1'
                }
            }
            emit("onchange", input.value!.value);
        }else if(shapes.length > 1) {
            
        }
    } else {
        const shapes = props.context.selection.selectedShapes;
        let result;
        if (props.svgicon === 'angle') {
            if (input.value!.value.slice(-1) && input.value!.value.slice(-1) === '°') {
                const rotate = get_rotation(shapes[0]);
                result = (rotate + scale.value.degX).toFixed(2)
            }
        }
        if (props.svgicon === 'radius') {
            const radius = (Number(input.value!.value) + scale.value.degX).toFixed(2);
            result = (+radius + scale.value.degX).toFixed(2)
            if (Number(input.value!.value) < 0) {
                result = '0'
            }
        }
        emit("onchange", result!)
    }
}, { deep: true });

watch(screenWidth, () => {
    screenWidth.value = window.innerWidth;
})
watch(screenHeight, () => {
    screenHeight.value = window.innerHeight;
})
onMounted(() => {
    window.addEventListener('resize', () => {
        screenWidth.value = window.innerWidth;
        screenHeight.value = window.innerHeight;
    });
})
</script>

<template>
    <div :class="{ icontext: true, disabled: props.disabled }">
        <svg-icon @mousedown="onMouseDown" class="icon" v-if="props.svgicon" :icon-class="props.svgicon" :style="{
            width: `${props.frame ? frame?.width : 18}px`,
            height: `${props.frame ? frame?.height : 18}px`,
            transform: `rotate(${props.frame ? frame?.rotate : 0}deg)`,
            cursor: (props.svgicon === 'radius' && props.multipleValues === true && !props.disabled) ? 'auto' : 'ew-resize'
        }"></svg-icon>
        <img :class="props.disabled ? 'deicon' : 'icon'" v-if="props.icon" :src="props.icon" />
        <span @mousedown="onMouseDown" :class="props.disabled ? 'deicon' : 'icon'" v-if="!props.icon && props.ticon">{{
            props.ticon }}</span>
        <input ref="input" @click="onBlur" @focus="selectValue" :value="props.text" @keydown="onKeyBlur"
            :disabled="props.disabled" :style="{ cursor: props.disabled ? 'default' : 'text' }" v-on:change="onChange" />
    </div>
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
        // cursor: ew-resize; // 关闭拖拽设值
        text-align: center;
    }

    >.deicon {
        color: grey;
        width: 14px;
        height: 14px;
        flex-shrink: 0;
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
        font-size: var(--font-default-fontsize);
        outline: none;
    }
}

.disabled {
    opacity: 0.4;
}
</style>