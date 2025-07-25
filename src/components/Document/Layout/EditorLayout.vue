/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import Divider from "@/components/Document/Layout/Divider.vue";
import { ref, computed, reactive, watch, onUnmounted, onMounted } from "vue";
import { Context } from "@/context";
import { EditorGUI } from "@/components/Document/Layout/editorlayout";
import { useI18n } from "vue-i18n";

const props = defineProps<{ context: Context }>();

const leftWidth = ref<number>(250);
const t = useI18n().t;
const leftStyle = computed<string>(() => {
    return `flex: 0 0 ${leftWidth.value}px; width: ${leftWidth.value}px;`
})

let real: number = leftWidth.value;

function offset(dx: number) {
    real += dx;
    if (real < 250 || real > 640) return;
    leftWidth.value = Math.min(Math.max(real, 250), 640);
}

const layout = reactive<EditorGUI>({
    top: true,
    left: true,
    right: true,
    leftTrigger: false,
    rightTrigger: false
});

let timerL: any = null;
let timerR: any = null;

function mouseenter(div: 'left' | 'right') {
    if (div === "left") {
        layout.leftTrigger = true;
        clearTimeout(timerL);
        timerL = null;
    } else if (div === "right") {
        layout.rightTrigger = true;
        clearTimeout(timerR);
        timerR = null;
    }
}

function mouseleave(div: 'left' | 'right') {
    if (div === "left") {
        clearTimeout(timerL);
        if (!layout.left) return;
        timerL = setTimeout(() => {
            layout.leftTrigger = false;
            clearTimeout(timerL);
            timerL = null;
        }, 500);
    } else if (div === "right") {
        clearTimeout(timerR);
        if (!layout.right) return;
        timerR = setTimeout(() => {
            layout.rightTrigger = false;
            clearTimeout(timerR);
            timerR = null;
        }, 500);
    }
}

const stop1 = watch(() => layout.left, (v) => {
    if (!v) {
        layout.leftTrigger = true;
        clearTimeout(timerL);
        timerL = null;
    }
});
const stop2 = watch(() => layout.right, (v) => {
    if (!v) {
        layout.rightTrigger = true;
        clearTimeout(timerR);
        timerR = null;
    }
});
onMounted(() => {
    props.context.layout.gui = layout;
    props.context.layout.next = t('layout.hideUI');
});
onUnmounted(() => {
    stop1();
    stop2();
});

import right_icon from '@/assets/icons/svg/right.svg';
import SvgIcon from '@/components/common/SvgIcon.vue';
</script>
<template>
<div class="editor-layout-wrapper">
    <div v-if="layout.top" class="top">
        <slot name="top"/>
    </div>
    <div class="selection">
        <div v-if="layout.left" class="left" :style="leftStyle"
             @mouseenter="mouseenter('left')"
             @mouseleave="mouseleave('left')">
            <slot name="left"/>
            <Divider locate="right" @offset="offset"/>
        </div>
        <div class="center">
            <div v-if="layout.leftTrigger" class="trigger left-d"
                 :style="layout.left?'':'opacity: 0.6;'"
                 @mouseenter="mouseenter('left')"
                 @mouseleave="mouseleave('left')"
                 @mousedown.stop="() => context.layout.left()"
            >
                <SvgIcon :icon="right_icon" :style="layout.left ? 'transform: rotate(180deg);': ''"/>
            </div>
            <slot name="center"/>
            <div v-if="layout.rightTrigger" class="trigger right-d"
                 :style="layout.right?'':'opacity: 0.6;'"
                 @mouseenter="mouseenter('right')"
                 @mouseleave="mouseleave('right')"
                 @mousedown.stop="() => context.layout.right()"
            >
                <SvgIcon :icon="right_icon" :style="layout.right ? '': 'transform: rotate(180deg);'"/>
            </div>
        </div>
        <div v-if="layout.right" class="right"
             @mouseenter="mouseenter('right')"
             @mouseleave="mouseleave('right')">
            <slot name="right"/>
        </div>
    </div>
</div>
</template>
<style scoped lang="scss">
.editor-layout-wrapper {
    background-color: #efefef;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    > .top {
        padding: 0 8px;
        box-sizing: border-box;
        width: 100%;
        height: 46px;
        flex: 0 0 46px;
        background: var(--theme-color);
        z-index: 2;
    }

    > .selection {
        width: 100%;
        flex: 1;
        background-color: #4a4a4a;
        display: flex;
        justify-content: space-between;
        overflow: hidden;

        > .left {
            position: relative;
            height: 100%;
            background: var(--theme-color-anti);
        }

        > .center {
            position: relative;
            flex: 1;
            height: 100%;
            background: #efefef;

            > .trigger {
                position: absolute;
                top: 22px;
                z-index: 9;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #FFFFFF;
                width: 16px;
                height: 44px;
                box-sizing: border-box;
                border: 1px solid #F0F0F0;
                padding: 14px 0;
            }

            > .left-d {
                left: 0;
                border-radius: 0 8px 8px 0;

                > svg {
                    width: 16px;
                    height: 16px;
                }
            }

            > .right-d {
                right: 0;
                border-radius: 8px 0 0 8px;

                > svg {
                    width: 16px;
                    height: 16px;
                }
            }
        }

        > .right {
            flex: 0 0 240px;
            width: 240px;
            height: 100%;
            background: var(--theme-color-anti);
        }
    }
}
</style>