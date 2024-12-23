<template>
    <div class="close" @click.stop="emits('close')">
        <SvgIcon :icon="close_icon"
            :style="{ width: size ? `${size}px` : '18px', height: size ? `${size}px` : '18px' }"/>
    </div>
</template>
<script setup lang="ts">
import close_icon from "@/assets/icons/close.svg"
import SvgIcon from "./SvgIcon.vue";

interface Props {
    size?: number
    width?: number
}
defineProps<Props>();
const emits = defineEmits<{
    (e: 'close'): () => void
}>();

</script>
<style lang="scss" scoped>
.close {
    display: flex;
    //padding: 4px;
    //margin: 2px 0 0 0;

    //&:hover {
    //    background-color: #f3f0ff;
    //    border-radius: 3px;
    //    cursor: pointer;
    //
    //    >svg {
    //        fill: #9775fa;
    //    }
    //}
    //
    //&:active>svg {
    //    transform: scale(0.9);
    //}
}
</style>
