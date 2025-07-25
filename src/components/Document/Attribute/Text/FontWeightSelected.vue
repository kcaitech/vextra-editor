/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

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
import { ref, onMounted, onUnmounted, watch } from "vue";
import { fontWeightList, fontweightNameConvert } from "./FontNameList";
import { Context } from "@/context";
import { WorkSpace } from "@/context/workspace";
import { useI18n } from 'vue-i18n';
import { TextContextMgr } from "./ctx";

const props = defineProps<{
    context: Context;
    selected: string;
    weightMixed?: boolean;
    fontName: string | undefined;
    disable?: boolean;
    reflush?: number
    manager?: TextContextMgr;
    data?: TextMask;
}>();
const emit = defineEmits<{
    (e: "setFontWeight", weight: number, italic: boolean): void;
}>();
const { t } = useI18n();
let fontWeight = ["Regular"];
const hovered = ref(-1);
const isSelectList = ref(false);
const top = ref(0);
const transTop = () => {
    const index = fontWeight.indexOf(props.selected);
    top.value = index;
}
const showWeightList = () => {
    if (props.disable) return;
    if (props.fontName) getFontWeightList(props.fontName);
    transTop();
    isSelectList.value = true;
    props.context.escstack.save('showWeightList', () => {
        const achieve = isSelectList.value;
        isSelectList.value = false;
        return achieve;
    })
    document.addEventListener("mousedown", onShowWeightBlur)
}
const onShowWeightBlur = (e: MouseEvent) => {
    if (e.target instanceof Element && !e.target.closest('.font_weight_select')) {
        var timer = setTimeout(() => {
            isSelectList.value = false;
            clearTimeout(timer)
            document.removeEventListener('mousedown', onShowWeightBlur);
        }, 10)
    }
}
const selectItem = (item: string) => {
    const { weight, italic } = fontweightNameConvert(item);
    if (item === props.selected) return;
    emit('setFontWeight', weight, italic);
    isSelectList.value = false;
}

function getFontWeightList(fontName: string) {
    const results = fontWeightList(fontName, true);
    if (!results.length) {
        return fontWeight = ["Regular"];
    }
    fontWeight = results.map((item: any) => {
        return item.key;
    })
}

const keyboardBold = () => {
    const { weight, italic } = fontweightNameConvert(props.selected);
    if (weight >= 700) return;
    if (!props.fontName) return
    const results = fontWeightList(props.fontName, true);
    results.forEach((item: any) => {
        if (italic === item.italic && item.weight >= 700) {
            return emit('setFontWeight', item.weight, item.italic);
        }
    })
}
const keyboardItalic = () => {
    const { weight, italic } = fontweightNameConvert(props.selected);
    if (italic) return;
    if (!props.fontName) return
    const results = fontWeightList(props.fontName, true);
    results.forEach((item: any) => {
        if (item.italic) {
            return emit('setFontWeight', weight, item.italic);
        }
    })
}

watch(() => props.fontName, (v) => {
    if (v) getFontWeightList(v);
})

const watcher_workspace = (t: number) => {
    if (t === WorkSpace.BOLD) {
        keyboardBold();
    } else if (t === WorkSpace.ITALIC) {
        keyboardItalic();
    }
}

onMounted(() => {
    props.context.workspace.watch(watcher_workspace);
})
onUnmounted(() => {
    props.context.workspace.unwatch(watcher_workspace);
})

import down_icon from '@/assets/icons/svg/down.svg';
import white_select_icon from '@/assets/icons/svg/white-select.svg';
import page_select_icon from '@/assets/icons/svg/page-select.svg';
import SvgIcon from '@/components/common/SvgIcon.vue';
import { TextMask } from "@kcaitech/vextra-core";

</script>

<template>
    <div v-bind="$attrs" class="font_weight jointly-text">
        <div :class="{ font_weight_preview: !disable, disabled: disable }" :style="{ opacity: disable ? 0.5 : 1 }"
            style="padding-right: 0;" @click="showWeightList">
            <span v-if="!manager?.textCtx.text?.weight && !data">{{ t('attr.more_value') }}</span>
            <span v-else>{{ selected }}</span>
            <div class="down">
                <SvgIcon :icon="down_icon" style="width: 12px;height: 12px" />
            </div>
        </div>
        <div class="font_weight_select" v-if="isSelectList" :style="{ top: -top * 32 - 8 + 'px' }">
            <div class="font_weight_item" v-for="(item, index) in fontWeight" :key="index"
                @mouseenter="() => hovered = index" :class="{ active: hovered === index }" @click="selectItem(item)">
                <div class="icon" v-if="selected === item">
                    <SvgIcon :icon="hovered === index ? white_select_icon : page_select_icon" />
                </div>
                <div class="icon" v-else></div>
                <span> {{ item }} </span>
            </div>
        </div>
    </div>
    <div class="overlay" @click.stop v-if="isSelectList" @mousedown.stop="isSelectList = false"></div>
</template>

<style scoped lang="scss">
.font_weight {
    position: relative;
    box-sizing: border-box;
    width: 50%;
    margin-right: 8px;
    border-radius: 6px;

    span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .font_weight_preview {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        height: 32px;
        box-sizing: border-box;
        border-radius: 6px;

        &:hover {
            background: #EBEBEB;
        }
    }

    .disabled {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        height: 32px;
        box-sizing: border-box;
        border-radius: 6px;
    }

    .font_weight_select {
        position: absolute;
        width: 100%;
        padding: 8px 0px;
        box-sizing: border-box;
        left: 0px;
        border-radius: 6px;
        background-color: #fff;
        box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.08);
        border: 1px solid #EBEBEB;
        color: #262626;
        z-index: 1001;

        .font_weight_item {
            display: flex;
            height: 32px;
            border-radius: 4px;
            align-items: center;

            .icon {
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;

                >svg {
                    width: 12px;
                    height: 12px;
                }
            }
        }
    }
}

.jointly-text {
    height: 32px;
    border-radius: var(--default-radius);
    background-color: var(--input-background);
    display: flex;
    justify-content: space-between;
    align-items: center;

    >svg {
        width: 16px;
        height: 16px;
        overflow: visible !important;
    }
}

.down {
    height: 12px;
    width: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    margin-right: 8px;
    box-sizing: border-box;

    >svg {
        width: 12px;
        height: 12px;
    }
}

.active {
    background-color: #1878F5;
    color: #fff;
}

.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
    background-color: transparent;
}

.weight {
    flex: 0.5;
    margin: 0;
}
</style>