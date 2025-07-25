/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { SelectItem } from '@/components/common/Select.vue'
import SvgIcon from '@/components/common/SvgIcon.vue';
interface Props {
    data: SelectItem;
    isCurValue: boolean;
}
interface Emits {
    (e: "select", data: SelectItem): void;
}
const props = defineProps<Props>();
const emits = defineEmits<Emits>();
const hoverApex = ref<boolean>(false);
function select() {
    emits('select', props.data);
}
const isEnd = computed<boolean>(() => {
    return props.data.content.startsWith('end');
})

import page_select_icon from '@/assets/icons/svg/page-select.svg';
import white_select_icon from '@/assets/icons/svg/white-select.svg';

import line_icon from '@/assets/icons/svg/line.svg';
import filled_arrow_icon from '@/assets/icons/svg/filled-arrow.svg';
import open_arrow_icon from '@/assets/icons/svg/open-arrow.svg';
import filled_circle_icon from '@/assets/icons/svg/filled-circle.svg';
import filled_square_icon from '@/assets/icons/svg/filled-square.svg';
import round_icon from '@/assets/icons/svg/round.svg';
import square_icon from '@/assets/icons/svg/square.svg';
import { MarkerType } from '@kcaitech/vextra-core';
const iconMap:{[key: string]: string} = {
    [MarkerType.Line]: line_icon,
    [MarkerType.FilledArrow]: filled_arrow_icon,
    [MarkerType.OpenArrow]: open_arrow_icon,
    [MarkerType.FilledCircle]: filled_circle_icon,
    [MarkerType.FilledSquare]: filled_square_icon,
    [MarkerType.Round]: round_icon,
    [MarkerType.Square]: square_icon,
}
import white_line_icon from '@/assets/icons/svg/white-line.svg';
import white_filled_arrow_icon from '@/assets/icons/svg/white-filled-arrow.svg';
import white_open_arrow_icon from '@/assets/icons/svg/white-open-arrow.svg';
import white_filled_circle_icon from '@/assets/icons/svg/white-filled-circle.svg';
import white_filled_square_icon from '@/assets/icons/svg/white-filled-square.svg';
import white_round_icon from '@/assets/icons/svg/white-round.svg';
import white_square_icon from '@/assets/icons/svg/white-square.svg';
const iconMap2:{[key: string]: string} = {
    [MarkerType.Line]: white_line_icon,
    [MarkerType.FilledArrow]: white_filled_arrow_icon,
    [MarkerType.OpenArrow]: white_open_arrow_icon,
    [MarkerType.FilledCircle]: white_filled_circle_icon,
    [MarkerType.FilledSquare]: white_filled_square_icon,
    [MarkerType.Round]: white_round_icon,
    [MarkerType.Square]: white_square_icon,
}

</script>
<template>
    <div class="border-front-style-item-container" @click="select" @mouseenter="hoverApex = true"
        @mouseleave="hoverApex = false">
        <SvgIcon :class="{ isEnd }" :icon="hoverApex ? iconMap2[props.data.value] : iconMap[props.data.value]"/>
        <SvgIcon class="check" v-show="props.isCurValue" :icon="hoverApex ? white_select_icon : page_select_icon"/>
    </div>
</template>
<style scoped lang="scss">
.border-front-style-item-container {
    height: 32px;

    padding: 0 6px;
    box-sizing: border-box;

    display: flex;
    align-items: center;
    justify-content: space-between;

    >img {
        width: 36px;
        height: 32px;
    }

    .check {
        width: 12px;
        height: 12px;
    }

    >.isEnd {
        transform: rotate(180deg);
    }
}

.border-front-style-item-container:hover {
    background-color: var(--active-color);

    >img {
        // fill: #FFFFFF;
        filter: invert(1);
    }
}
</style>