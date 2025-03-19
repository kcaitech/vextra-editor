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
import { Shadow } from "@kcdesign/data";
import { onUnmounted, ref, watchEffect } from "vue";
import { MaskInfo } from "@/components/Document/Attribute/basic";
import MaskPort from "@/components/Document/Attribute/StyleLib/MaskPort.vue";
import { ShadowCatch, ShadowsContextMgr } from "./ctx";
import { useI18n } from "vue-i18n";

/**
 * 当图层使用样式库里的样式之后，属性面板不再展示详细的样式信息，取而代之的是该样式库里对应样式的基本信息
 * 本组件是由该基本信息为状态的组件。除了展示基本信息之外，本组件可以打开样式库面板、解绑样式、删除该样式；
 */
const props = defineProps<{
    context: Context;
    manager: ShadowsContextMgr;
    shadows: ShadowCatch[];
    info: MaskInfo;
    active: boolean;
}>();
const emits = defineEmits<{
    (e: "show-style-lib", event: MouseEvent): void;
}>();

const t = useI18n().t;

const shadows = ref<Shadow[]>(props.shadows.map(i => i.shadow).reverse());
const name = ref<string>(props.info.name);

const style = ref<string>('');

onUnmounted(watchEffect(() => {
    shadows.value = props.shadows.map(i => i.shadow).reverse();
    name.value = props.info.name;
    if (shadows.value.length) {
        const represent = shadows.value[0];
        style.value = `box-shadow: ${represent.position.includes('in') ? 'inset' : ''}`
            + ` ${represent.offsetX > 0 ? '1px' : represent.offsetX < 0 ? '-1px' : '0'}`
            + ` ${represent.offsetY > 0 ? '1px' : represent.offsetY < 0 ? '-1px' : '0'} `
            + ` ${represent.blurRadius > 0 ? '1px' : '0'}`
            + ` ${represent.spread > 0 ? '1px' : '0'}`
            + ' #0000004d'
    } else style.value = '';
}));
</script>
<template>
    <MaskPort @delete="() => manager.removeMask()" @unbind="() => manager.unbind()" :active="active" :disabled="info.disabled">
        <div class="shadow-desc" @click="event => emits('show-style-lib', event)">
            <div class="effect" :style="style"/>
            <span>{{ info.disabled ? t('stylelib.deleted_style') : name }}</span>
        </div>
    </MaskPort>
</template>
<style scoped lang="scss">
.shadow-desc {
    flex: 1;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 8px;

    .effect {
        width: 14px;
        height: 14px;
        background-color: #fff;
        border: 1px solid #000000e5;
        border-radius: 3px;
        overflow: hidden;
    }

    > span {
        display: inline-block;
        flex: 0 0 116px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}
</style>