<script setup lang="ts">
import { ref, watch } from 'vue';
import Tooltip from '@/components/common/Tooltip.vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const props = defineProps<{
    ticon: string
    shadowV: number
    tootip?: string
    disabled?: boolean
}>();
const emits = defineEmits<{
    (e: 'onChange', value: number): void;
}>();
const input = ref<HTMLInputElement>();
const isActived = ref(false)
const selectValue = () => {
    isActived.value = true
    if (input.value) {
        input.value.select()
    }
}

const onChange = () => {
    if (input.value) {
        let value = input.value.value;
        if (isNaN(Number(value)) || !value.trim().length) {
            return input.value.value = String(props.shadowV);
        }
        if (Number(value) > 3000) value = '3000';
        if (Number(value) < -3000) value = '-3000';
        if (props.ticon === 'B') {
            if (Number(value) > 200) value = '200';
            if (Number(value) < 0) value = '0';
        }
        emits('onChange', Number(value));
    }
}
const augment = () => {
    if (input.value && !props.disabled) {
        let value = input.value.value;
        if (Number(value) === 3000 || (props.ticon === 'B' && Number(value) === 200)) return;
        const result = +value + 1;
        emits('onChange', result);
    }
}
const decrease = () => {
    if (input.value && !props.disabled) {
        let value = input.value.value;
        if (Number(value) === -3000 || (props.ticon === 'B' && Number(value) === 0)) return;
        const result = +value - 1;
        emits('onChange', result);
    }
}
const curpt: { x: number } = { x: 0 };
const _curpt: { x: number } = { x: 0 };
const isDrag = ref(false);
const onMouseDown = (e: MouseEvent) => {
    e.stopPropagation();
    if (props.disabled) return;
    curpt.x = e.screenX;
    _curpt.x = e.screenX;
    isDrag.value = true;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
}
const onMouseMove = (e: MouseEvent) => {
    let mx = e.screenX - curpt.x;
    const diff = e.screenX - _curpt.x;
    if ((diff > 3 || diff < 3) && input.value) {
        curpt.x = e.screenX
        let value = input.value.value;
        if (mx > 0) {
            if (Number(value) === 3000 || (props.ticon === 'B' && Number(value) === 200)) return;
            const result = +value + 1;
            emits('onChange', result);
        } else if (mx < 0) {
            if (Number(value) === -3000 || (props.ticon === 'B' && Number(value) === 0)) return;
            const result = +value - 1;
            emits('onChange', result);
        }
    }
}
const onMouseUp = (e: MouseEvent) => {
    e.stopPropagation();
    isDrag.value = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
}
function blur2() {
    isActived.value = false
}
</script>

<template>
    <div class="input-container" :class="{ disabled: props.disabled, actived: isActived }">
        <Tooltip v-if="props.tootip && !props.disabled" :content="props.tootip" :offset="12">
            <span class="icon" ref="icon" @mousedown="onMouseDown">{{ ticon }}</span>
        </Tooltip>
        <span class="icon" ref="icon" v-if="!props.tootip || props.disabled" @mousedown="onMouseDown"
            :style="{ cursor: props.disabled ? 'default' : 'ew-resize' }">{{ ticon }}</span>
        <Tooltip v-if="props.tootip && props.disabled" :content="props.tootip" :offset="12">
            <input ref="input" :value="props.shadowV" @focus="selectValue" :disabled="props.disabled"
                :style="{ cursor: props.disabled ? 'default' : 'text' }" @change="onChange">
        </Tooltip>
        <input v-if="!props.disabled" ref="input" :value="props.shadowV" @focus="selectValue" :disabled="props.disabled"
            :style="{ cursor: props.disabled ? 'default' : 'text' }" @change="onChange" @blur="blur2">
        <div class="adjust" :class="{ active: isActived }">
            <svg-icon icon-class="down" style="transform: rotate(180deg);"
                :style="{ cursor: props.disabled ? 'default' : 'pointer' }" @click="augment"></svg-icon>
            <svg-icon icon-class="down" :style="{ cursor: props.disabled ? 'default' : 'pointer' }"
                @click="decrease"></svg-icon>
        </div>
    </div>
</template>

<style scoped lang="scss">
.input-container {
    display: flex;
    white-space: nowrap;
    width: 88px;
    height: 32px;
    overflow: hidden;
    padding: 3px 3px 3px 12px;
    align-items: center;
    //padding-left: 12px;
    //padding-right: 3px;
    box-sizing: border-box;
    background-color: var(--input-background);
    border-radius: var(--default-radius);
    margin-left: 8px;

    .icon {
        flex-shrink: 0;
        cursor: ew-resize;
        text-align: center;
        width: 8px;
        height: 16px;
        font-family: HarmonyOS Sans;
        font-size: 12px;
        color: #8C8C8C;
    }

    input {
        width: 100%;
        flex: 1 1 auto;
        align-content: center;
        margin-left: 6px;
        color: #000000;
        font-family: HarmonyOS Sans;
        text-overflow: ellipsis;
        background-color: transparent;
        border: none;
        font-size: var(--font-default-fontsize);
        outline: none;
    }

    input::selection {
        color: #FFFFFF;
        background: #1878F5;
    }

    input::-moz-selection {
        color: #FFFFFF;
        background: #1878F5;
    }

    .adjust {
        width: 19px;
        height: 100%;
        flex: 0 0 19px;
        //background-color: #fff;
        //margin-left: 5px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-around;
        box-sizing: border-box;
        border-radius: 4px;

        >svg {
            cursor: pointer;
            width: 12px;
            height: 12px;
            color: #666666;
        }
    }

    .adjust:hover {
        background-color: #EBEBEB;
    }

    .adjust.active {
        background-color: #EBEBEB;
    }

    //.adjust.active {
    //    background-color: #EBEBEB !important;
    //}
}

.disabled {
    opacity: 0.4;
}
.actived {
    border: 1px solid #1878F5;
}
</style>