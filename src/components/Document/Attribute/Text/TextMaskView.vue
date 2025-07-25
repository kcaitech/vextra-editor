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
import { Context } from "@/context";
import { onUnmounted, ref, watchEffect } from "vue";
import { MaskInfo } from "@/components/Document/Attribute/basic";
import MaskPort from "@/components/Document/Attribute/StyleLib/MaskPort.vue";
import { TextContext, TextContextMgr } from "./ctx";
import { useI18n } from "vue-i18n";

/**
 * 当图层使用样式库里的样式之后，属性面板不再展示详细的样式信息，取而代之的是该样式库里对应样式的基本信息
 * 本组件是由该基本信息为状态的组件。除了展示基本信息之外，本组件可以打开样式库面板、解绑样式、删除该样式；
 */
const props = defineProps<{
    context: Context;
    manager: TextContextMgr;
    info: MaskInfo;
    active: boolean;
}>();
const emits = defineEmits<{
    (e: "show-style-lib", event: MouseEvent): void;
}>();

const t = useI18n().t;

const name = ref<string>(props.info.name);

onUnmounted(watchEffect(() => {
    name.value = props.info.name;
}));
import SvgIcon from "@/components/common/SvgIcon.vue";
import text from "@/assets/icons/svg/text-icon.svg";
</script>
<template>
    <MaskPort :active="active" :disabled="info.disabled" :delete="false" @unbind="()=>manager.unbind()">
        <div class="text_desc" @click="event => emits('show-style-lib', event)">
            <div class="effect">
                <SvgIcon :icon="text" />
            </div>
            <div class="name">{{ info.disabled ? t('stylelib.deleted_style') : info.name }}</div>
        </div>
    </MaskPort>
</template>
<style scoped lang="scss">
.text_desc {
    flex: 1;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 8px;

    .effect {
        width: 16px;
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;


        img {
            width: 100%;
            height: 100%;
        }
    }

    .name {
        flex: 0 0 116px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}
</style>