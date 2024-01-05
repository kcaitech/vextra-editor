<script lang="ts" setup>
import { ref, nextTick, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { cloneDeep } from 'lodash';
import SvgIcon from "@/components/common/SvgIcon.vue";
import { onMounted } from 'vue';
export interface SelectItem {
    value: string | number,
    content: string
}
export interface SelectSource {
    id: number,
    data: SelectItem
}

interface Props {
    source: SelectSource[];
    selected: SelectItem | null;

    itemHeight?: number;
    itemWidth?: number;

    valueView?: any;
    itemView?: any;
}

interface Emits {
    (e: "select", value: SelectItem): void;
}

const DEFAULT_ITEM_HEIGHT = 32;
const TOPBAR_HEIGHT = (() => {
    const t = document.querySelector('#app > .main > #top');
    return t?.clientHeight || 46;
})();
const PADDING = 10;
const PADDING_TOP = 4;

const props = defineProps<Props>();
const emits = defineEmits<Emits>();

const { t } = useI18n();

const curValue = ref<SelectItem | null>(null);
const curValueIndex = ref<number>(-1);
const curHoverValueIndex = ref<number>(-1);
const selectContainer = ref<HTMLDivElement>();
const optionsContainer = ref<HTMLDivElement>();
const optionsContainerVisible = ref<boolean>(false);
const source = ref<SelectSource[]>([]);

function toggle() {
    optionsContainerVisible.value = !optionsContainerVisible.value;
    if (!optionsContainerVisible.value) {
        return;
    }

    nextTick(options);
}

function options() {
    const oe = optionsContainer.value;
    const se = selectContainer.value;
    if (!oe || !se) {
        return;
    }

    const wrap_rect = se.getBoundingClientRect();
    const options_rect = oe.getBoundingClientRect();

    const zero = wrap_rect.y;

    const documnet_height = document.documentElement.clientHeight;

    const item_height = props.itemHeight || DEFAULT_ITEM_HEIGHT;

    let top = 0;

    if (curValueIndex.value === -1) {
        top = item_height;
    } else {
        top = curValueIndex.value * item_height;
    }

    const over = zero + options_rect.height + PADDING - documnet_height;

    if (over > 0) {
        top += over;
    }
    const TOP = zero - TOPBAR_HEIGHT
    if (top > TOP) {
        top = top - PADDING;
    }

    oe.style.top = `${-(top + PADDING_TOP)}px`;

    oe.addEventListener('keydown', esc);
    oe.addEventListener('blur', onBlur);
    oe.focus();
}

function esc(e: KeyboardEvent) {
    e.stopPropagation();
    if (e.code === 'Escape') {
        optionsContainerVisible.value = false;
        clear_events();
    }
}

function clear_events() {
    optionsContainer.value?.removeEventListener('keydown', esc);
    optionsContainer.value?.removeEventListener('blur', onBlur);
}

function onBlur() {
    optionsContainerVisible.value = false;
    clear_events();
}

function select(data: SelectItem) {
    const index = source.value.findIndex((item: SelectSource) => item.data === data);

    curValueIndex.value = index;
    curValue.value = data;

    emits('select', curValue.value);

    optionsContainerVisible.value = false;
    clear_events();
}

function render() {
    if (props.source.length) {
        source.value = cloneDeep(props.source);
    }
    if (props.selected && source.value.length) {
        const index = source.value.findIndex(i => i.data.value === props.selected!.value);

        if (index > -1) {
            curValueIndex.value = index;
            curValue.value = props.selected;
        }
    }
}

watch(() => props.selected, render);
onMounted(render)
</script>
<template>
    <div class="select-container" ref="selectContainer">
        <div class="trigger" @click="toggle">
            <div v-if="!props.valueView" class="value-wrap">{{ curValue?.content }}</div>
            <div v-else class="value-wrap">
                <component :is="props.valueView" v-bind="$attrs" :data="curValue" />
            </div>
            <div class="svg-wrap">
                <svg-icon icon-class="down"></svg-icon>
            </div>
        </div>

        <div v-if="optionsContainerVisible" @click.stop class="options-container" ref="optionsContainer" tabindex="-1">
            <div v-if="!source.length" class="no-data">
                {{ t('system.empty') }}
            </div>
            <div v-else-if="props.itemView">
                <component v-for="(c, idx) in source" v-bind="$attrs" :is="props.itemView" :key="c.id" :data="c.data"
                    :isCurValue="idx === curValueIndex" @select="select" />
            </div>
            <div v-else>
                <div v-for="(c, idx) in source" class="item-default" :key="c.id" @click="() => select(c.data)" @mouseover="curHoverValueIndex = idx" @mouseleave="curHoverValueIndex = -1">
                    <div class="content-wrap"> {{ c.data.content }}</div>
                    <svg-icon v-if="idx === curValueIndex" :icon-class="curHoverValueIndex === idx ? 'white-select': 'page-select'"></svg-icon>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped lang="scss">
.select-container {
    position: relative;


    .trigger {
        width: 100%;
        height: 100%;

        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;

        background-color: #F5F5F5;
        border-radius: var(--default-radius);
        padding: 0 7px;
        box-sizing: border-box;

        .value-wrap {
            flex: 1;
            // height: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        >.svg-wrap {
            flex: 0 0 12px;
            height: 100%;
            display: flex;
            align-items: center;

            >svg {
                width: 100%;
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
        background-color: #EBEBEB;
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
            width: 100%;
            height: 32px;
            font-size: var(--font-default-fontsize);
            font-weight: 500;
            box-sizing: border-box;
            padding: 0 7px;
            display: flex;

            align-items: center;

            .content-wrap {
                flex: 1;

                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            >svg {
                flex: 0 0 12px;
                height: 12px;
            }
        }

        .item-default:hover {
            background-color: var(--active-color);
            color: #FFFFFF;
        }
    }
}
</style>