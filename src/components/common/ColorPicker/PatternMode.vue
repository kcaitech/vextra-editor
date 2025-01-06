<script setup lang="ts">
import { Context } from '@/context';
import { ColorCtx } from '@/context/color';
import { fixedZero } from '@/utils/common';
import { ImageScaleMode } from '@kcdesign/data';
import { v4 } from 'uuid';
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const props = defineProps<{
    context: Context
    scale: number | undefined
    imageScaleMode: ImageScaleMode | undefined
}>()
const emits = defineEmits<{
    (e: 'changeMode', mode: ImageScaleMode): void;
    (e: 'changeRotate'): void;
    (e: 'changeScale', scale: number): void;
}>();
const isMenu = ref(false);
const activeItem = ref(props.imageScaleMode);
const hoverItem = ref(props.imageScaleMode);
const menu = ref<HTMLDivElement>();
const mode = ref<HTMLDivElement>();
const image_scale = ref(props.scale);
const showMenu = (e: MouseEvent) => {
    if (isMenu.value) return isMenu.value = false;
    activeItem.value = props.imageScaleMode;
    hoverItem.value = props.imageScaleMode;
    isMenu.value = true;
    nextTick(() => {
        if (menu.value && mode.value) {
            const rect = mode.value.getBoundingClientRect();
            menu.value.style.left = rect.x + 'px';
            let top = -4;
            if (props.imageScaleMode === ImageScaleMode.Fit) {
                top -= 32;
            } else if (props.imageScaleMode === ImageScaleMode.Stretch) {
                top -= 64;
            } else if (props.imageScaleMode === ImageScaleMode.Tile) {
                top -= 96;
            }
            menu.value.style.top = rect.y + top + 'px';
        }
    })
    props.context.escstack.save(v4(), close);
}

const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (e.target instanceof Element && !e.target.closest('.pattern_selected')) {
        isMenu.value = false;
    }
}
function close() {
    const is_achieve_expected_results = isMenu.value;
    isMenu.value = false;
    return is_achieve_expected_results;
}

const setScaleMode = (mode: ImageScaleMode) => {
    if (mode === activeItem.value) return isMenu.value = false;
    activeItem.value = mode;
    emits('changeMode', mode);
    isMenu.value = false;
    if (mode === ImageScaleMode.Tile) {
        props.context.color.setImageScale(props.scale);
    } else if (mode === ImageScaleMode.Crop) {
    } else {
        props.context.color.setImageScale();
    }
    props.context.color.setImageScaleMode(mode);
}

const changeRotate = () => {
    emits('changeRotate');
}

const input = ref<HTMLInputElement>();
const isActived = ref(false)
const selectValue = () => {
    isActived.value = true
}

const onChange = () => {
    if (input.value) {
        let value = parseFloat(input.value.value);
        if (isNaN(value) || value <= 0) {
            return input.value.value = (props.scale || 0.5) * 100 + '%';
        }
        if (value > 1000) value = 1000;
        emits('changeScale', value);
        image_scale.value = value / 100;
        props.context.color.setImageScale(value / 100);
        input.value.blur();
        input.value.value = fixedZero(value) + '%';
    }
}
const is_select = ref(false);
function click() {
    if (!input.value) return;
    const el = input.value;
    if (el.selectionStart !== el.selectionEnd) {
        return;
    }
    if (is_select.value) return;
    el.select();
    is_select.value = true;
}

const colorWatcher = (t: number) => {
    if (t === ColorCtx.TILE_CHANGE) {
        const scale = props.context.color.imageScale || 0.5;
        image_scale.value = scale;
        if (input.value) {
            input.value.value = fixedZero(scale * 100) + '%';
        }
    }
}

onMounted(() => {
    props.context.color.watch(colorWatcher);
})

onUnmounted(() => {
    props.context.color.unwatch(colorWatcher);
})

import SvgIcon from '../SvgIcon.vue';
import down_icon from "@/assets/icons/svg/down.svg"
import rotate90_icon from "@/assets/icons/svg/rotate90.svg"
import choose_icon from "@/assets/icons/svg/choose.svg"

</script>

<template>
    <div class="mode_container">
        <div class="options">
            <div class="mode" ref="mode" @click.stop="showMenu">
                <div class="option">{{ t(`pattern.${activeItem || ImageScaleMode.Fill}`) }}</div>
                <div class="down">
                    <SvgIcon :icon="down_icon"/>
                </div>
            </div>
            <div class="scale" v-if="activeItem === ImageScaleMode.Tile">
                <input type="text" ref="input" @click="click" :value="fixedZero((image_scale || 0.5) * 100) + '%'"
                    @focus="selectValue" @change="onChange">
            </div>
        </div>
        <div class="rotate" @click="changeRotate">
            <SvgIcon :icon="rotate90_icon"/>
        </div>
    </div>
    <div class="overlay" @mousedown.stop @click.stop="handleClick" v-if="isMenu">
        <div class="pattern_selected" ref="menu">
            <div class="item" @mouseenter="hoverItem = ImageScaleMode.Fill" @click="setScaleMode(ImageScaleMode.Fill)"
                :class="{ active: hoverItem === ImageScaleMode.Fill }">
                <div class="choose">
                    <SvgIcon :icon="choose_icon" v-if="activeItem === ImageScaleMode.Fill"/>
                </div>
                <span>{{ t(`pattern.${ImageScaleMode.Fill}`) }}</span>
            </div>
            <div class="item" @mouseenter="hoverItem = ImageScaleMode.Fit" @click="setScaleMode(ImageScaleMode.Fit)"
                :class="{ active: hoverItem === ImageScaleMode.Fit }">
                <div class="choose">
                    <SvgIcon :icon="choose_icon" v-if="activeItem === ImageScaleMode.Fit"/>
                </div>
                <span>{{ t(`pattern.${ImageScaleMode.Fit}`) }}</span>
            </div>
            <div class="item" @mouseenter="hoverItem = ImageScaleMode.Stretch"
                @click="setScaleMode(ImageScaleMode.Stretch)" :class="{ active: hoverItem === ImageScaleMode.Stretch }">
                <div class="choose">
                    <SvgIcon :icon="choose_icon" v-if="activeItem === ImageScaleMode.Stretch"/>
                </div>
                <span>{{ t(`pattern.${ImageScaleMode.Stretch}`) }}</span>
            </div>
            <div class="item" @mouseenter="hoverItem = ImageScaleMode.Tile" @click="setScaleMode(ImageScaleMode.Tile)"
                :class="{ active: hoverItem === ImageScaleMode.Tile }">
                <div class="choose">
                    <SvgIcon :icon="choose_icon" v-if="activeItem === ImageScaleMode.Tile"/>
                </div>
                <span>{{ t(`pattern.${ImageScaleMode.Tile}`) }}</span>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.mode_container {
    display: flex;
    width: 100%;
    height: 32px;
    align-items: center;
    box-sizing: border-box;

    .options {
        font-size: 12px;
        flex: 1;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-right: 6px;
        gap: 6px;

        .mode {
            flex: 1;
            height: 100%;
            display: flex;
            align-items: center;
            background-color: #f4f5f5;
            border-radius: 4px;
            &:hover {
                background-color: #EBEBEB;
            }

            .option {
                flex: 1;
                display: flex;
                align-items: center;
                padding-left: 8px;
            }

            .down {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 30px;
                height: 30px;
            }
        }

        .scale {
            display: flex;
            height: 100%;
            width: 60px;
            border-radius: 4px;
            background-color: #f4f5f5;

            input {
                width: 100%;
                flex: 1 1 auto;
                align-content: center;
                padding-left: 8px;
                color: #000000;
                font-family: HarmonyOS Sans;
                text-overflow: ellipsis;
                background-color: transparent;
                border: none;
                font-size: var(--font-default-fontsize);
                outline: none;
                box-sizing: border-box;
            }

            input::selection {
                color: #FFFFFF;
                background: #1878F5;
            }

            input::-moz-selection {
                color: #FFFFFF;
                background: #1878F5;
            }

            .input-text {
                border: none;
                outline: none;
            }

            input[type="range"]:focus {
                outline: none;
            }
        }

        svg {
            width: 14px;
            height: 14px;
            outline: none;
        }
    }

    .rotate {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        cursor: pointer;

        &:hover {
            background-color: #f5f5f5;
        }

        svg {
            width: 14px;
            height: 14px;
            outline: none;
        }
    }
}

.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10003;
    background-color: transparent;

    .pattern_selected {
        position: absolute;
        left: 0;
        width: 126px;
        padding: 4px 0px;
        background-color: #ffffff;
        border-radius: 6px;
        box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.2);

        .item {
            display: flex;
            align-items: center;
            width: 100%;
            height: 32px;

            .choose {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;

                svg {
                    width: 12px;
                    height: 12px;
                }
            }

        }
    }
}

.active {
    background-color: var(--active-color);

    .choose {
        svg {
            fill: #ffffff;
        }
    }

    span {
        color: #fff;
    }
}
</style>