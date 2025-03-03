<script setup lang="ts">
import SvgIcon from "@/components/common/SvgIcon.vue";
import close_icon from "@/assets/icons/svg/close.svg";

defineProps<{ title: string }>();
const emits = defineEmits(["close"]);
</script>
<template>
    <div class="header">
        <div class="title">{{ title }}</div>
        <div class="close" @click.stop="emits('close')">
            <SvgIcon :icon="close_icon"/>
        </div>
    </div>
</template>
<style scoped lang="scss">
.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 40px;
    padding: 0 8px;
    border-bottom: 1px solid #f0f0f0;
    box-sizing: border-box;

    .close {
        width: 28px;
        height: 28px;
        display: flex;
        border-radius: 4px;

        &:hover {
            background-color: #F5F5F5;
        }

        img {
            width: 16px;
            height: 16px;
            margin: auto;
            padding: 2px;
            box-sizing: border-box;
        }
    }
}
</style>