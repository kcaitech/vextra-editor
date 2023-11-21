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
const selectValue = () => {
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
</script>

<template>
    <div class="input-container" :class="{ disabled: props.disabled }">
        <Tooltip v-if="props.tootip && !props.disabled" :content="props.tootip" :offset="12">
            <span class="icon" ref="icon" @mousedown="onMouseDown">{{ ticon }}</span>
        </Tooltip>
        <span class="icon" ref="icon" v-if="!props.tootip || props.disabled" @mousedown="onMouseDown"
            :style="{ cursor: props.disabled ? 'default' : 'ew-resize' }">{{ ticon }}</span>
        <Tooltip v-if="props.disabled" :content="`${t('shadow.only_used')}`" :offset="12">
            <input ref="input" :value="props.shadowV" @focus="selectValue" :disabled="props.disabled"
                :style="{ cursor: props.disabled ? 'default' : 'text' }" @change="onChange">
        </Tooltip>
        <input v-if="!props.disabled" ref="input" :value="props.shadowV" @focus="selectValue" :disabled="props.disabled"
            :style="{ cursor: props.disabled ? 'default' : 'text' }" @change="onChange">
        <div class="adjust">
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
    width: 90px;
    height: 30px;
    overflow: hidden;
    padding: 1px;
    align-items: center;
    padding-left: 8px;
    padding-right: 3px;
    box-sizing: border-box;
    background-color: rgba(#D8D8D8, 0.4);
    border-radius: 4px;

    .icon {
        color: grey;
        width: 14px;
        flex-shrink: 0;
        cursor: ew-resize;
        text-align: center;
    }

    input {
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

    .adjust {
        width: 20px;
        height: 100%;
        background-color: #fff;
        margin-left: 5px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-around;
        box-sizing: border-box;

        >svg {
            cursor: pointer;
            width: 10px;
            height: 12px;
            color: grey;
        }
    }
}

.disabled {
    opacity: 0.4;
}
</style>