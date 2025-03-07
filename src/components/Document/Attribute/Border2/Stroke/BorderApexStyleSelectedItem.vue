/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script lang="ts" setup>
import { SelectItem } from '@/components/common/Select.vue';
import SvgIcon from '@/components/common/SvgIcon.vue';
import { MarkerType } from '@kcdesign/data';
import { computed, watch } from 'vue'
const props = defineProps<{
    data: SelectItem | null
}>();
const isEnd = computed<boolean>(() => {
    return !!props.data?.content.startsWith('end');
})

import line_icon from '@/assets/icons/svg/line.svg';
import filled_arrow_icon from '@/assets/icons/svg/filled-arrow.svg';
import open_arrow_icon from '@/assets/icons/svg/open-arrow.svg';
import filled_circle_icon from '@/assets/icons/svg/filled-circle.svg';
import filled_square_icon from '@/assets/icons/svg/filled-square.svg';
import round_icon from '@/assets/icons/svg/round.svg';
import square_icon from '@/assets/icons/svg/square.svg';
const iconMap:{[key: string]: string} = {
    [MarkerType.Line]: line_icon,
    [MarkerType.FilledArrow]: filled_arrow_icon,
    [MarkerType.OpenArrow]: open_arrow_icon,
    [MarkerType.FilledCircle]: filled_circle_icon,
    [MarkerType.FilledSquare]: filled_square_icon,
    [MarkerType.Round]: round_icon,
    [MarkerType.Square]: square_icon,
}
</script>
<template>
    <div class="item-container">
        <svg-icon :class="{ isEnd }" :icon="iconMap[props.data?.value ?? MarkerType.Line]"/>
    </div>
</template>
<style scoped lang="scss">
.item-container {
    width: 100%;
    height: 32px;
    display: flex;
    align-items: center;

    >img {
        width: 40px;
        height: auto;
    }

    >.isEnd {
        transform: rotate(180deg);
    }
}
</style>