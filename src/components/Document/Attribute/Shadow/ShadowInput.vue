<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
    ticon: string
    shadowV: number
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
    if(input.value) {
        let value = input.value.value;
        if (isNaN(Number(value)) || !value.trim().length) {
            return input.value.value = String(props.shadowV);
        }
        if(Number(value) > 3000) value = '3000';
        if(Number(value) < -3000) value = '-3000';
        if(props.ticon === 'B') {
            if(Number(value) > 200) value = '200';
            if(Number(value) < 0) value = '0';
        }
        emits('onChange', Number(value));
    }
}
const augment = () => {
    if(input.value) {
        let value = input.value.value;
        if(Number(value) === 3000 || (props.ticon === 'B' && Number(value) === 200)) return;
        const result = +value + 1;
        emits('onChange', result);
    }
}
const decrease = () => {
    if(input.value) {
        let value = input.value.value;
        if(Number(value) === -3000 || (props.ticon === 'B' && Number(value) === 0)) return;
        const result = +value - 1;
        emits('onChange', result);
    }
}
</script>

<template>
    <div class="input-container">
        <span class="icon">{{ ticon }}</span>
        <input ref="input" :value="props.shadowV" @focus="selectValue" @change="onChange">
        <div class="adjust">
            <svg-icon icon-class="down" style="transform: rotate(180deg);" @click="augment"></svg-icon>
            <svg-icon icon-class="down" @click="decrease"></svg-icon>
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
</style>