<script lang="ts" setup>
import { SelectItem } from '@/components/common/Select.vue';
import SvgIcon from '@/components/common/SvgIcon.vue';
import solid_icon from '@/assets/icons/svg/solid.svg';
import dash_icon from '@/assets/icons/svg/dash.svg';
const props = defineProps<{
    data: SelectItem | null
}>();

const border_style_icons: { [key: string]: string } = {
    'solid': solid_icon,
    'dash': dash_icon
}

</script>

<template>
    <div class="item-container">
        <SvgIcon :icon="props.data?.value === 'dash' ? dash_icon : solid_icon" />
        <span>{{ props.data?.content }}</span>
    </div>
</template>

<style scoped lang="scss">
.item-container {
    width: 100%;
    height: 32px;
    display: flex;
    align-items: center;
    gap: 8px;

    >span {
        flex: 0 0 40px;
    }

    >img {
        width: auto;
        height: 100%;
        color: #BFBFBF;
        // margin-right: 12px;
    }
}
</style>