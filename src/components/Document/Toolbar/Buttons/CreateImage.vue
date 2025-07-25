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
import ToolButton from './ToolButton.vue';
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
import { ref } from 'vue';
import { string_by_sys } from '@/utils/common';
import Tooltip from '@/components/common/Tooltip.vue';
import { ImageLoader } from "@/imageLoader";
import SvgIcon from '@/components/common/SvgIcon.vue';

const { t } = useI18n();
const props = defineProps<{
    params: {
        active: boolean
    },
    context: Context
}>();
const accept = 'image/png, image/jpeg, image/gif, image/svg+xml';
const picker = ref<HTMLInputElement>();

async function select() {
    picker.value?.click();
}

function change(e: Event) {
    if (!e.target) return;
    const files = (e.target as HTMLInputElement).files;
    if (!files) return;
    const loader = new ImageLoader(props.context);
    loader.insertImageByPackages(files, true);
    if (picker.value) (picker.value as HTMLInputElement).value = '';
}
import picture_icon from '@/assets/icons/svg/picture.svg';
</script>
<template>
<Tooltip :content="string_by_sys(`${t('home.picture')} &nbsp;&nbsp; Shift Ctrl K`)">
    <ToolButton ref="button" @click="select" :selected="props.params.active">
        <div class="svg-container">
            <SvgIcon :icon="picture_icon"/>
        </div>
    </ToolButton>
</Tooltip>
<input type="file" ref="picker" :accept="accept" :multiple="true" id="filepicker"
       @change="(e: Event) => { change(e) }"/>
</template>
<style scoped lang="scss">
.svg-container {
    width: 32px;
    height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #ffffff;
    padding: 6px 6px 6px 6px;
    box-sizing: border-box;

    > img {
        width: 18px;
        height: 18px;
    }
}

#filepicker {
    display: none;
}
</style>