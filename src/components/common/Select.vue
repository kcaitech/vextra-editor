<script lang="ts" setup>
import { ref, defineProps, nextTick, onMounted, defineEmits, watch } from 'vue';
import { cloneDeep } from 'lodash';
export interface SelectItem {
    value: string,
    content: string
} 

const emit = defineEmits<{
    (e: "select", value: SelectItem): void;
}>();
const curValue = ref<SelectItem>();
const curValueIndex = ref<number>(0);
const props = defineProps<{
    selected?: SelectItem,
    source: Array<any>,
    itemView?: any,
    itemHeight: number,
    width?: number
}>();
const optionsContainer = ref<HTMLDivElement>();
const optionsContainerVisible = ref<boolean>(false);
const source: any = ref();
function toggle() {
    optionsContainerVisible.value = !optionsContainerVisible.value
    nextTick(() => {
        if(optionsContainer.value) {
            // const rect = optionsContainer.value.getBoundingClientRect();
            optionsContainer.value.focus();
            optionsContainer.value.addEventListener('blur', onBlur);
            optionsContainer.value.addEventListener('keydown', esc);
            optionsContainer.value.style.top = `${-curValueIndex.value * (props.itemHeight || 32)}px`;
        }
    })
}
function esc(e: KeyboardEvent) {
    if (e.code === 'Escape') {
        optionsContainerVisible.value = false;
        optionsContainer.value?.removeEventListener('keydown', esc);
    }
}
function onBlur() {
    optionsContainerVisible.value = false;
    optionsContainer.value?.removeEventListener('blur', onBlur);
}
function select(data: SelectItem) {
    const index = source.value.findIndex((item: any) => item.data === data);
    curValueIndex.value = index;
    curValue.value = data;
    emit('select', curValue.value);
    optionsContainerVisible.value = false;
    optionsContainer.value?.removeEventListener('keydown', esc);
    optionsContainer.value?.removeEventListener('blur', onBlur);
}

onMounted(() => {
    if (props.source.length) {
        source.value = cloneDeep(props.source);
    }
    if (props.selected && props.source.length) {
        curValue.value = props.selected;
        const index = source.value.findIndex((i: any) => i.data.value === curValue.value?.value);
        if (index > 0) curValueIndex.value = index;
    }
})
</script>
<template>
<div class="select-container" :style="{
    width: props.width ? `${props.width}px` : '100%'
}">
    <div class="trigger" @click="toggle">
        <div class="value-wrap">{{ curValue?.content }}</div>
        <div class="svg-wrap">
            <svg-icon icon-class="down"></svg-icon>
        </div>
    </div>
    <div @click.stop class="options-container" ref="optionsContainer" tabindex="-1" v-if="optionsContainerVisible">
        <div v-if="!source.length" class="no-data">
            no data
        </div>
        <div v-else>
            <component
                :is="props.itemView"
                v-for="(c) in source"
                :key="c.id"
                :data="c.data"
                v-bind="$attrs"
                @select="select"
            />
        </div>
        <div class="checkout" :style="{
            top: `${curValueIndex * props.itemHeight + props.itemHeight / 2}px`
        }"></div>
    </div>
</div>
</template>
<style scoped lang="scss">
.select-container {
    position: relative;
    .trigger {
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
        height: 32px;
        background-color: var(--input-background);
        border-radius: var(--default-radius);
        .value-wrap {
            flex: 1 1 auto;
            height: 100%;
            text-align: left;
            line-height: 32px;
            box-sizing: border-box;
            padding: 0 var(--default-padding);
        }
        > .svg-wrap {
            height: 100%;
            flex: 0 0 24px;
            display: flex;
            align-items: center;
            > svg {
                width: 10px;
                height: 10px;
                transition: 0.3s;
            }
        }
        > .svg-wrap:hover {
            > svg {
                transform: translateY(2px);
            }
        }
    }
    .options-container {
        width: 100%;
        position: absolute;
        outline: none;
        background-color: var(--theme-color);
        border-radius: var(--default-radius);
        overflow: hidden;
        z-index: 1;
        .no-data {
            height: 32px;
            color: var(--theme-color-anti);
            line-height: 32px;
        }
        .checkout {
            top: 0px;
            position: absolute;
            box-sizing: border-box;
            width: 10px;
            height: 6px;
            border-width: 0 0 2px 2px;
            border-style: solid;
            border-color: var(--theme-color-anti);
            left: 6px;
            transform: rotate(-45deg) translateY(-50%);
        }
    }
}
</style>