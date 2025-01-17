<script lang="ts" setup>
import { Context } from "@/context";
import down_icon from "@/assets/icons/svg/down.svg";
import SvgIcon from "@/components/common/SvgIcon.vue";

// const {context, options, value} = defineProps<{
//     context: Context;
//     options: { label: string; value: any } [];
//     value: any;
// }>();
const emits = defineEmits(['update:value']);
</script>
<template>
    <div class="select-banana-wrapper">
        <span class="info">我选香蕉🍌</span>
        <div class="icon">
            <SvgIcon :icon="down_icon"/>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.select-banana-wrapper {
    width: 100%;
    height: 32px;
    border-radius: var(--default-radius);
    background-color: var(--input-background);
    position: relative;
    display: flex;
    align-items: center;
    padding: 0 8px;
    box-sizing: border-box;

    .info {
        flex: 1;
        width: 50px;
        font-size: var(--font-default-fontsize);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .icon {
        flex: 0 0 24px;
        width: 24px;
        height: 24px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;

        > svg {
            width: 12px;
            height: 12px;
        }
    }

    &:hover {
        .icon {
            background-color: #e5e5e5;
        }
    }
}
</style>