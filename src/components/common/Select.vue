<script lang="ts" setup>
import { ref, nextTick, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { cloneDeep } from 'lodash';
import SvgIcon from "@/components/common/SvgIcon.vue";
export interface SelectItem {
    value: string | number,
    content: string
}
export interface SelectSource {
    id: number,
    data: SelectItem
}

const emit = defineEmits<{
    (e: "select", value: SelectItem): void;
}>();
const { t } = useI18n();
const curValue = ref<SelectItem>();
const curValueIndex = ref<number>(-1);
const props = defineProps<{
    itemHeight: number,
    source: SelectSource[],
    selected?: SelectItem,
    itemView?: any,
    valueView?: any
    width?: number,
    type?: string
}>();
const selectContainer = ref<HTMLDivElement>();
const optionsContainer = ref<HTMLDivElement>();
const optionsContainerVisible = ref<boolean>(false);
const source = ref<SelectSource[]>([]);
function toggle() {
    if(props.type === 'table') return;
    optionsContainerVisible.value = !optionsContainerVisible.value;
    nextTick(() => {
        if (optionsContainer.value && selectContainer.value) {
            const selectedToTop = curValueIndex.value * (props.itemHeight || 30);
            optionsContainer.value.style.top = `${-selectedToTop}px`;
            const selectContainerRect = selectContainer.value.getBoundingClientRect();
            const optionsContainerRect = optionsContainer.value.getBoundingClientRect();
            const documentClientHeight = document.documentElement.clientHeight - 30;
            const optionsContainerTop = selectContainerRect.top - selectedToTop;

            const over = optionsContainerTop + optionsContainerRect.height - documentClientHeight;
            if (over > 0) {
                optionsContainer.value.style.top = `${-(selectedToTop + over + 4)}px`;
            }
            const top = optionsContainerTop - 40;
            if (top < 0) {
                optionsContainer.value.style.top = `${-(selectedToTop + top - 4)}px`;
            }
            optionsContainer.value.addEventListener('keydown', esc);
            optionsContainer.value.addEventListener('blur', onBlur);
            optionsContainer.value.focus();
        }
    })
}
function esc(e: KeyboardEvent) {
    e.stopPropagation();
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
    const index = source.value.findIndex((item: SelectSource) => item.data === data);
    curValueIndex.value = index;
    curValue.value = data;
    emit('select', curValue.value);
    optionsContainerVisible.value = false;
    optionsContainer.value?.removeEventListener('keydown', esc);
    optionsContainer.value?.removeEventListener('blur', onBlur);
}

function render() {
    if (props.source.length) {
        source.value = cloneDeep(props.source);
    }
    if (props.selected && props.source.length) {
        curValue.value = props.selected;
        const index = source.value.findIndex((i: SelectSource) => i.data.value === curValue.value?.value);
        if (index > -1) curValueIndex.value = index;
    }
}

watch(() => props.selected, () => {
    render();
}, { immediate: true })
</script>
<template>
    <div class="select-container" :style="{
        width: props.width ? `${props.width}px` : '100%'
    }" ref="selectContainer">
        <div class="trigger" @click="toggle">
            <div class="value-wrap" v-if="!props.valueView">{{ curValue?.content }}</div>
            <div v-else class="value-wrap">
                <component :is="props.valueView" :data="curValue" />
            </div>
            <div class="svg-wrap" v-show="props.type !== 'table'">
                <svg-icon icon-class="down"></svg-icon>
            </div>
        </div>
        <div @click.stop class="options-container" ref="optionsContainer" tabindex="-1" v-if="optionsContainerVisible">
            <div v-if="!source.length" class="no-data">
                {{ t('system.empty') }}
            </div>
            <div v-else-if="props.itemView">
                <component :is="props.itemView" v-for="c in source" :key="c.id" :data="c.data" v-bind="$attrs"
                    @select="select" />
            </div>
            <div v-else>
                <div class="item-default" v-for="c in source" :key="c.id" v-bind="$attrs" @click="() => select(c.data)">
                    {{ c.data.content }}
                </div>
            </div>
            <div v-if="curValue" class="check"
                :style="{ top: `${curValueIndex * props.itemHeight + props.itemHeight / 2.4}px` }">
                <svg-icon icon-class="choose"></svg-icon>
            </div>
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
        width: 68px;
        height: 32px;
        background-color: var(--input-background);
        border-radius: var(--default-radius);

        .value-wrap {
            flex: 1 1 auto;
            height: 100%;
            margin-left: 12px;
            line-height: var(--default-input-height);
            box-sizing: border-box;
            //padding: 0 var(--default-padding);
            //margin-left: 6px;
            //margin-right: 8px;
            font-weight: 500;
        }

        >.svg-wrap {
            height: 100%;
            flex: 0 0 18px;
            display: flex;
            align-items: center;
            //margin-left: 8px;

            >svg {
                width: 12px;
                height: 12px;
                transition: 0.3s;
                color: #666666;
            }
        }

        >.svg-wrap:hover {
            >svg {
                transform: translateY(2px);
            }
        }
    }

    .trigger:hover {
        background-color: #EBEBEB !important;
    }

    .options-container {
        width: 100%;
        position: absolute;
        outline: none;
        background-color: #FFFFFF;
        box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.08);
        border-radius: 8px;
        overflow: hidden;
        z-index: 1;
        border: 1px solid #EBEBEB;
        padding: 4px 0;
        box-sizing: border-box;

        .no-data {
            height: var(--default-input-height);
            color: var(--theme-color);
            line-height: var(--default-input-height);
        }

        .item-default {
            height: 32px;
            color: #262626;
            padding: 9px 0 9px 12px;
            //text-align: left;
            font-size: 12px;
            font-weight: 500;
            box-sizing: border-box;
        }

        .item-default:hover {
            background-color: #1878F5;
            color: #FFFFFF;
        }

        .check {
            top: 0px;
            position: absolute;
            box-sizing: border-box;
            //width: 10px;
            //height: 6px;
            //border-width: 0 0 2px 2px;
            //border-style: solid;
            //border-color: var(--theme-color);
            left: 48px;
            //transform: rotate(-45deg) translateY(-50%);
            >svg {
                width: 12px;
                height: 12px;
            }
        }
    }
}
</style>