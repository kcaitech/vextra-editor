<script setup lang="ts">
import SvgIcon from "@/components/common/SvgIcon.vue";
import unbind_icon from "@/assets/icons/svg/unbind.svg";
import delete_icon from "@/assets/icons/svg/delete.svg";

const emits = defineEmits<{
    (e: "delete"): void;
    (e: "unbind"): void;
}>();
</script>

<template>
    <div class="mask-port-wrapper">
        <div class="info-container">
            <div class="info">
                <slot/>
            </div>
            <div class="unbind" @click="emits('unbind')">
                <SvgIcon :icon="unbind_icon"/>
            </div>
        </div>
        <div class="delete" @click="emits('delete')">
            <SvgIcon :icon="delete_icon"/>
        </div>
    </div>
</template>

<style scoped lang="scss">
.mask-port-wrapper {
    width: 100%;
    height: 32px;
    transition: 50ms;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 0;

    .info-container {
        flex: 1;
        width: 50px;
        height: 100%;
        display: flex;
        background-color: var(--input-background);
        border-radius: var(--default-radius);
        overflow: hidden;

        .info {
            flex: 1;
            width: 50px;
            height: 100%;
            transition: 50ms;

            &:hover {
                background-color: #e5e5e5;
            }
        }

        .unbind {
            display: flex;
            align-items: center;
            justify-content: center;
            flex: 0 0 28px;
            width: 28px;
            height: 100%;
            transition: 50ms;
            background-color: var(--input-background);

            > img {
                width: 16px;
                height: 16px;
            }

            &:hover {
                background-color: #e5e5e5;
            }
        }
    }

    .delete {
        flex: 0 0 28px;
        width: 28px;
        height: 28px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: var(--default-radius);
        overflow: hidden;
        transition: 50ms;

        > svg {
            width: 16px;
            height: 16px;
        }

        &:hover {
            background-color: var(--input-background);
        }
    }
}
</style>