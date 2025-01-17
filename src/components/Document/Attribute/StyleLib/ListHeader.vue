<script setup lang="ts">
import SvgIcon from "@/components/common/SvgIcon.vue";
import add_icon from "@/assets/icons/svg/add.svg";
defineProps<{ title: string }>();
const emits = defineEmits(["create"]);
</script>
<template>
    <div class="list-header">
        <div class="title">{{ title}}</div>
        <div class="create" @click.stop="emits('create')">
            <SvgIcon :icon="add_icon"/>
        </div>
    </div>
</template>
<style scoped lang="scss">
.list-header {
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 0 12px;
    box-sizing: border-box;

    .create {
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
        }
    }
}
</style>