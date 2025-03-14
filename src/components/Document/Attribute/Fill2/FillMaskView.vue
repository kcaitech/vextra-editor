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
import { Context } from "@/context";
import { FillCatch, FillsContextMgr } from "@/components/Document/Attribute/Fill2/ctx";
import { Fill } from "@kcdesign/data";
import ColorBlock from "@/components/common/ColorBlock/Index.vue";
import { onUnmounted, ref, watchEffect } from "vue";
import { MaskInfo } from "@/components/Document/Attribute/basic";
import MaskPort from "@/components/Document/Attribute/StyleLib/MaskPort.vue";
import { useI18n } from "vue-i18n";

/**
 * 当图层使用样式库里的样式之后，属性面板不再展示详细的样式信息，取而代之的是该样式库里对应样式的基本信息
 * 本组件是由该基本信息为状态的组件。除了展示基本信息之外，本组件可以打开样式库面板、解绑样式、删除该样式；
 */
const props = defineProps<{
    context: Context;
    manager: FillsContextMgr;
    fills: FillCatch[];
    info: MaskInfo;
    active: boolean;
}>();
const emits = defineEmits<{
    (e: "show-style-lib", event: MouseEvent): void;
}>();
const t = useI18n().t;

const colors = ref<Fill[]>(props.fills.map(i => i.fill).reverse());
const name = ref<string>(props.info.name);

onUnmounted(watchEffect(() => {
    colors.value = props.fills.map(i => i.fill).reverse();
    name.value = props.info.name;
}));
</script>
<template>
    <MaskPort :active="active" :disabled="info.disabled"
              @delete="() => manager.removeMask()" @unbind="() => manager.unbind()">
        <div class="fill-desc" @click="event => emits('show-style-lib', event)">
            <ColorBlock :colors="colors as Fill[]" round disabled-alpha/>
            <span>{{ info.disabled ? t('stylelib.deleted_style') : name }}</span>
        </div>
    </MaskPort>
</template>
<style scoped lang="scss">
.fill-desc {
    flex: 1;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 8px;

    span {
        display: inline-block;
        flex: 0 0 116px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}
</style>