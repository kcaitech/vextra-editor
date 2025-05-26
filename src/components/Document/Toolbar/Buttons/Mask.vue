/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import ToolButton from './ToolButton.vue';
import { useI18n } from 'vue-i18n'
import { Context } from '@/context';
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { Selection } from "@/context/selection";
import { useMask } from "@/components/Document/Creator/execute";
import { ShapeType } from "@kcdesign/data";

const { t } = useI18n()
const props = defineProps<{
    context: Context
}>();

const disabled = ref<boolean>(false);

function mask() {
    useMask(props.context);
}

function statusUpdater(t: any) {
    if (t === Selection.CHANGE_SHAPE){
         const shapes = props.context.selection.selectedShapes;
        if (shapes.length && shapes.some(i => i.type !== ShapeType.Cutout)) {
            disabled.value = true
        } else {
            disabled.value = false
        }
    }
}
onMounted(() => {
    props.context.selection.watch(statusUpdater);
});
onUnmounted(() => {
    props.context.selection.unwatch(statusUpdater);
});

import pattern_mask_icon from '@/assets/icons/svg/pattern-mask.svg';
import SvgIcon from '@/components/common/SvgIcon.vue';

</script>

<template>
<el-tooltip
    class="box-item"
    effect="dark"
    :content="`${t('system.create_mask')} Ctrl Alt M`"
    placement="bottom"
    :show-after="600"
    :offset="10"
    :hide-after="0"
>
    <ToolButton
        :selected="false"
        :style="{ width: '32px', 'pointer-events': disabled ? 'auto' : 'none' }"
        @click="mask"
    >
        <div class="svg-container" :style="{opacity: disabled ? 1 : 0.4}">
            <SvgIcon :icon="pattern_mask_icon"/>
        </div>
    </ToolButton>
</el-tooltip>
</template>

<style scoped lang="scss">
.svg-container {
    width: 32px;
    height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;

    transition: 0.1s;

    > img {
        width: 18px;
        height: 18px;
    }
}
</style>