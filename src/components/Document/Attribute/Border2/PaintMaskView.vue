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
import { Context } from "@/context";
import { FillCatch } from "@/components/Document/Attribute/Fill2/ctx";
import { Fill } from "@kcdesign/data";
import ColorBlock from "@/components/common/ColorBlock/Index.vue";
import { onUnmounted, ref, watchEffect } from "vue";
import { MaskInfo } from "@/components/Document/Attribute/basic";
import MaskPort from "@/components/Document/Attribute/StyleLib/MaskPort.vue";
import { StrokeFillContextMgr } from "./ctx";
import { useI18n } from "vue-i18n";

const props = defineProps<{
    context: Context;
    manager: StrokeFillContextMgr;
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
    <MaskPort :disabled="info.disabled" :active="active" @delete="() => manager.removeMask()"
              @unbind="() => manager.unbind()">
        <div class="border_desc" @click="event => emits('show-style-lib', event)">
            <ColorBlock :colors="colors as Fill[]" round disabled-alpha/>
            <span>{{ info.disabled ? t('stylelib.deleted_style') : name }}</span>
        </div>
    </MaskPort>
</template>
<style scoped lang="scss">
.border_desc {
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