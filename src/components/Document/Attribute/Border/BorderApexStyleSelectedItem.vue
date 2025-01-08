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