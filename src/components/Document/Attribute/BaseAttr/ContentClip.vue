/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import { Context } from "@/context";
import { ArtboardView, ShapeType } from "@kcdesign/data";
import { useI18n } from "vue-i18n";
import SvgIcon from "@/components/common/SvgIcon.vue";

const t = useI18n().t;
const props = defineProps<{ context: Context; selectionChange: number; trigger: any[] }>();
const status = ref<number>(0) // 0 不裁； 1 全裁； 2 混合；

function updateStatus() {
    status.value = 0;
    const selected = props.context.selection.selectedShapes.filter(i => i.type === ShapeType.Artboard || i.type === ShapeType.Symbol || i.type === ShapeType.SymbolRef);
    const existClip = selected.some(i => !(i as ArtboardView).frameMaskDisabled);
    const existUnClip = selected.some(i => (i as ArtboardView).frameMaskDisabled);
    status.value = existClip ? existUnClip ? 2 : 1 : 0;
}

function modify() {
    const editor = props.context.editor4Page(props.context.selection.selectedPage!);
    editor.modifyContainersFrameMaskStatus(props.context.selection.selectedShapes, status.value === 1);
}

const stop = watch(() => props.selectionChange, updateStatus);
const stop2 = watch(() => props.trigger, updateStatus);
onMounted(updateStatus);
onUnmounted(() => {
    stop();
    stop2();
})

import select_icon from "@/assets/icons/svg/select.svg";
</script>
<template>
    <div style="height: 28px;display: flex; align-items: center; gap: 6px;" @click="modify">
        <div class="check" :style="{
            'background-color': status ? 'var(--active-color)' : 'transparent',
            'border': status ? 'none' : '1px solid #EBEBEB'
        }">
            <SvgIcon v-if="status === 1" :icon="select_icon" />
            <div v-else-if="status === 2" />
        </div>
        <span>{{ t('attr.clip') }}</span>
    </div>
</template>
<style lang="scss" scoped>
.check {
    flex: 0 0 14px;
    width: 14px;
    height: 14px;
    background: #fff;
    border-radius: 4px;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;

    img {
        width: 60%;
        height: 60%;
    }

    >div {
        width: 60%;
        height: 1px;
        background-color: #fff;
    }
}
</style>