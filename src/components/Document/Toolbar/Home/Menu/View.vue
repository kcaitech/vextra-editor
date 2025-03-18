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
import ViewSubMenu from './ViewSubMenu.vue';
import { ref, reactive } from 'vue';
import { Context } from '@/context';
import { useI18n } from 'vue-i18n';
import { XY } from '@/context/selection';
import SvgIcon from "@/components/common/SvgIcon.vue";

const { t } = useI18n();

interface Props {
    context: Context,
    site?: { x: number, y: number }
}

// interface Emits {
//     (e: 'rename'): void;
// }
const emit = defineEmits<{
    (e: 'close'): void;
}>();
const props = defineProps<Props>();
// const emit = defineEmits<Emits>();
// const popoverVisible = ref<boolean>(false);
const childMenuVisible = ref<boolean>(false);
const childMenuPosition: XY = reactive({ x: 0, y: 0 });

function showChildFileMenu(e: MouseEvent) {
    childMenuPosition.x = (e.target as Element).getBoundingClientRect().width;
    childMenuPosition.y = -10;
    childMenuVisible.value = true
}

const closeChildFileMenu = () => {
    childMenuVisible.value = false
}

function close() {
    childMenuVisible.value = false;
    // popoverVisible.value = false;
    emit('close');
}

import arrowhead_icon from '@/assets/icons/svg/arrowhead.svg';
</script>
<template>

    <span @mouseenter="(e: MouseEvent) => showChildFileMenu(e)" @mouseleave="closeChildFileMenu">
        {{ t('fileMenu.view') }}
        <div class="childMenu">
            <!--                    <div class="triangle"></div>-->
            <SvgIcon :icon="arrowhead_icon"/>
            <ViewSubMenu v-if="childMenuVisible" :context="props.context" :x="childMenuPosition.x"
                :y="childMenuPosition.y" :width="180" :site="site" @close="close"></ViewSubMenu>
        </div>
    </span>

</template>
<style scoped lang="scss">
.childMenu {

    >svg {
        height: 16px;
        width: 16px;
        margin-right: 8px;
        margin-left: 60px;
        margin-top: 4px;
    }
}
</style>