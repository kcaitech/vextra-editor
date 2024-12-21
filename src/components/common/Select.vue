<script lang="ts" setup>
import { ref, nextTick, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { cloneDeep } from 'lodash';
import SvgIcon from "@/components/common/SvgIcon.vue";
import { onMounted } from 'vue';
import { PrototypeConnectionType, PrototypeEvents, PrototypeNavigationType, ShapeType, ShapeView } from '@kcdesign/data';
import { Context } from '@/context';
export interface SelectItem {
    value: string | number,
    content: string,
    icon?: string,
    type?: string
}
export interface SelectSource {
    id: number,
    data: SelectItem,
}

interface Props {
    source: SelectSource[];
    selected?: SelectItem;
    context?: Context;
    itemHeight?: number;
    itemWidth?: number;
    index?: number;
    valueView?: any;
    itemView?: any;
    mixed?: boolean;
    shapes?: ShapeView[];
    visibility?: boolean;
    minwidth?: number;
    action?: PrototypeNavigationType;
    animation?: boolean;
    status?: boolean;
    iscontainer?: boolean;
}

interface Emits {
    (e: "select", value: SelectItem, index: number): void;
}

const DEFAULT_ITEM_HEIGHT = 32;
const TOPBAR_HEIGHT = (() => {
    const t = document.querySelector('#app > .main > #top');
    return t?.clientHeight || 46;
})();
const PADDING = 10;
const PADDING_TOP = 4;
const TAB_HEIGHT = 40;

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
    // console.log(props.source, arr.value);

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
    const over = zero + options_rect.height + PADDING - documnet_height;

    if (over > 0) {
        top += over;
    } else {
        if (curValueIndex.value === -1) {
            top = item_height;
        } else {
            top = curValueIndex.value * item_height;
        }
    }
    const TOP = zero - TOPBAR_HEIGHT - TAB_HEIGHT
    if (top > TOP) {
        top = TOP - PADDING;
    }
    if (props.mixed) top = 0;
    oe.style.top = `${-(top + PADDING_TOP)}px`;
    if (props.minwidth) oe.style.minWidth = props.minwidth + 'px'

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
    //延迟选项是否可选
    if (data.value === PrototypeEvents.AFTERTIMEOUT && !props.iscontainer) return

    //组件状态切换是否可选
    if (data.value === PrototypeConnectionType.INTERNALNODE && data.type === PrototypeNavigationType.SWAPSTATE && !props.status) return

    const index = source.value.findIndex((item: SelectSource) => item.data === data);
    curValueIndex.value = index;
    if (curValue.value?.content === data.content) return optionsContainerVisible.value = false, clear_events();;
    curValue.value = data;
    emits('select', curValue.value, props.index!);
    optionsContainerVisible.value = false;
    clear_events();

}

function render() {
    curHoverValueIndex.value = -1
    // console.log(props.source, props.action, props.selected);

    if (props.source.length) {
        source.value = cloneDeep(props.source);
    }
    if (props.selected && source.value.length) {
        source.value = cloneDeep(props.source);
        if (props.action) {
            if (props.action === PrototypeNavigationType.OVERLAY || props.action === PrototypeNavigationType.SWAP) {
                source.value = source.value.filter(i => i.data.content !== t('prototype.animation_animate'));
                arr.value = [t('prototype.animation_instant'), t('prototype.animation_dissolve'), t('prototype.animation_movein')]
            }
            if (props.action === PrototypeNavigationType.SWAPSTATE) {
                source.value = source.value.filter(i => i.data.content !== t('prototype.animation_animate'));
                arr.value = [t('prototype.animation_instant'), t('prototype.animation_dissolve'), t('prototype.animation_smart')]
            }
            if (props.action === PrototypeNavigationType.SCROLLTO) {
                source.value = source.value.filter(i => [t('prototype.animation_instant'), t('prototype.animation_animate')].includes(i.data.content));
                arr.value = [t('prototype.animation_instant'), t('prototype.animation_animate')]
            }
            if (props.action === PrototypeNavigationType.NAVIGATE) {
                source.value = source.value.filter(i => i.data.content !== t('prototype.animation_animate'));
                arr.value = [t('prototype.animation_instant'), t('prototype.animation_dissolve'), t('prototype.animation_movein'), t('prototype.animation_moveout'), t('prototype.animation_slidein'), t('prototype.animation_slideout'), t('prototype.animation_push'), t('prototype.animation_smart')]
            }
        }
        const index = source.value.findIndex(i => i.data.value === props.selected!.value && i.data.type === props.selected!.type);
        if (index > -1 || props.mixed) {
            curValueIndex.value = index;
            curValue.value = props.selected;
        }
    }
}

const showOP = ref<boolean>(false)
const arr = ref<string[]>([])
watchEffect(() => {
    if (props.shapes) {
        showOP.value = [ShapeType.Table, ShapeType.Line].includes(props.shapes[0].type)
    }
})

watch(() => props.selected, render);
watch(() => props.action, render);
onMounted(() => {
    render()
})
</script>

<template>
    <div class="select-container" ref="selectContainer">
        <div class="trigger" @click="toggle">
            <div class="icon-img" v-if="curValue?.icon">
                <svg-icon :icon-class="curValue?.icon"></svg-icon>
            </div>
            <div v-if="!props.valueView || mixed" class="value-wrap" :style="{ opacity: showOP ? 0.3 : 1 }">{{
                curValue?.content }}
            </div>
            <div v-else class="value-wrap">
                <component :is="props.valueView" v-bind="$attrs" :data="curValue" />
            </div>
            <div class="svg-wrap" :style="{ opacity: showOP ? 0.3 : 1 }">
                <svg-icon icon-class="down"></svg-icon>
            </div>
        </div>

        <div v-if="optionsContainerVisible" @click.stop class="options-container" ref="optionsContainer" tabindex="-1">
            <div v-if="mixed">
                <div class="item-default disabled">
                    <div class="content-wrap"> {{ t('attr.mixed') }}</div>
                </div>
            </div>
            <div v-if="!source.length" class="no-data">
                {{ t('system.empty') }}
            </div>
            <div v-else-if="props.itemView">
                <component v-for="(c, idx) in source" v-bind="$attrs" :is="props.itemView" :key="c.id" :data="c.data"
                    :isCurValue="idx === curValueIndex" @select="select" />
            </div>
            <div v-else-if="visibility">
                <div v-for="(c, idx) in source" class="item-default" :style="c.data.type === PrototypeNavigationType.SWAPSTATE ? {
                    pointerEvents: props.status ? 'auto' : 'none',
                    opacity: props.status ? 1 : 0.4,
                    borderTop: '1px solid #EBEBEB',
                    borderBottom: '1px solid #EBEBEB',
                } : c.data.content === '延迟' ? {
                    pointerEvents: props.iscontainer ? 'auto' : 'none',
                    opacity: props.iscontainer ? 1 : 0.4
                } : {}" :key="c.id" @click="() => select(c.data)" @mouseover="curHoverValueIndex = idx"
                    @mouseleave="curHoverValueIndex = -1">
                    <svg-icon :style="{ visibility: curValueIndex === idx ? 'visible' : 'hidden' }"
                        :icon-class="curHoverValueIndex === idx ? 'white-select' : 'page-select'"></svg-icon>
                    <svg-icon v-if="c.data.icon" class="icon" :icon-class="c.data.icon!"></svg-icon>
                    <div class="content-wrap"> {{ c.data.content }}</div>
                </div>
            </div>
            <div v-else-if="animation">
                <div v-for="(c, idx) in source" class="item-default" :style="{
                    pointerEvents: (arr.includes(c.data.content)) ? 'auto' : 'none',
                    opacity: (arr.includes(c.data.content)) ? 1 : 0.4
                }" :key="c.id" @click="() => select(c.data)" @mouseover="curHoverValueIndex = idx"
                    @mouseleave="curHoverValueIndex = -1">
                    <svg-icon :style="{ visibility: curValueIndex === idx ? 'visible' : 'hidden' }"
                        :icon-class="curHoverValueIndex === idx ? 'white-select' : 'page-select'"></svg-icon>
                    <svg-icon v-if="c.data.icon" class="icon" :icon-class="c.data.icon!"></svg-icon>
                    <div class="content-wrap"> {{ c.data.content }}</div>

                </div>
            </div>
            <div v-else>
                <div v-for="(c, idx) in source" class="item-default" :key="c.id" @click="() => select(c.data)"
                    @mouseover="curHoverValueIndex = idx" @mouseleave="curHoverValueIndex = -1">
                    <div class="content-wrap"> {{ c.data.content }}</div>
                    <svg-icon v-if="idx === curValueIndex"
                        :icon-class="curHoverValueIndex === idx ? 'white-select' : 'page-select'"></svg-icon>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.select-container {
    height: 32px;
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
        padding: 0 9px;
        box-sizing: border-box;

        .icon-img {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: #1878F5;
            margin-right: 8px;
            overflow: hidden;
            display: flex;

            svg {
                margin: auto;
                width: 12px;
                height: 12px;
                color: white;
            }
        }

        .value-wrap {
            flex: 1;
            // height: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        >.svg-wrap {
            flex: 0 0 10px;
            height: 10px;
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
        box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.08);
        border-radius: 8px;
        overflow: hidden;
        z-index: 9999;
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
            gap: 8px;

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

            .icon {
                fill: currentColor;
                color: #8C8C8C;
            }
        }

        .disabled {
            border-bottom: 1px solid #efefef;
            pointer-events: none;

            >div {
                color: #787878;
                pointer-events: none;
            }
        }

        .item-default:hover {
            background-color: var(--active-color);
            color: #FFFFFF;

            .icon {
                color: #fff;
            }
        }
    }
}
</style>