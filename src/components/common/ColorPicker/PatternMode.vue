<script setup lang="ts">
import { Context } from '@/context';
import { ImageScaleMode } from '@kcdesign/data';
import { v4 } from 'uuid';
import { nextTick, ref } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const props = defineProps<{
    context: Context
    scale: number | undefined
    imageScaleMode: ImageScaleMode | undefined
}>()
const emits = defineEmits<{
    (e: 'changeMode', mode: ImageScaleMode): void;
}>();
const isMenu = ref(false);
const activeItem = ref(props.imageScaleMode);
const hoverItem = ref(props.imageScaleMode);
const menu = ref<HTMLDivElement>();
const mode = ref<HTMLDivElement>();
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
    props.context.esctask.save(v4(), close);
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
    if (mode === activeItem.value) return;
    activeItem.value = mode;
    emits('changeMode', mode);
    isMenu.value = false;
}
</script>

<template>
    <div class="mode_container">
        <div class="options">
            <div class="mode" ref="mode" @click.stop="showMenu">
                <div class="option">{{ t(`pattern.${activeItem || ImageScaleMode.Fill}`) }}</div>
                <div class="down">
                    <svg-icon icon-class="down"></svg-icon>
                </div>
            </div>
            <div class="scale" v-if="activeItem === ImageScaleMode.Tile"></div>
        </div>
        <div class="rotate">
            <svg-icon icon-class="rotate90"></svg-icon>
        </div>
    </div>
    <div class="overlay" @mousedown.stop @click.stop="handleClick" v-if="isMenu">
        <div class="pattern_selected" ref="menu">
            <div class="item" @mouseenter="hoverItem = ImageScaleMode.Fill" @click="setScaleMode(ImageScaleMode.Fill)"
                :class="{ active: hoverItem === ImageScaleMode.Fill }">
                <div class="choose">
                    <svg-icon icon-class="choose" v-if="activeItem === ImageScaleMode.Fill"></svg-icon>
                </div>
                <span>{{ t(`pattern.${ImageScaleMode.Fill}`) }}</span>
            </div>
            <div class="item" @mouseenter="hoverItem = ImageScaleMode.Fit" @click="setScaleMode(ImageScaleMode.Fit)"
                :class="{ active: hoverItem === ImageScaleMode.Fit }">
                <div class="choose">
                    <svg-icon icon-class="choose" v-if="activeItem === ImageScaleMode.Fit"></svg-icon>
                </div>
                <span>{{ t(`pattern.${ImageScaleMode.Fit}`) }}</span>
            </div>
            <div class="item" @mouseenter="hoverItem = ImageScaleMode.Stretch"
                @click="setScaleMode(ImageScaleMode.Stretch)" :class="{ active: hoverItem === ImageScaleMode.Stretch }">
                <div class="choose">
                    <svg-icon icon-class="choose" v-if="activeItem === ImageScaleMode.Stretch"></svg-icon>
                </div>
                <span>{{ t(`pattern.${ImageScaleMode.Stretch}`) }}</span>
            </div>
            <div class="item" @mouseenter="hoverItem = ImageScaleMode.Tile" @click="setScaleMode(ImageScaleMode.Tile)"
                :class="{ active: hoverItem === ImageScaleMode.Tile }">
                <div class="choose">
                    <svg-icon icon-class="choose" v-if="activeItem === ImageScaleMode.Tile"></svg-icon>
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
            height: 100%;
            width: 60px;
            border-radius: 4px;
            background-color: #f4f5f5;
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

        &:hover {
            background-color: #f5f5f5;
        }

        cursor: pointer;

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