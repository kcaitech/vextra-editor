<template>
    <div class="close" @click.stop="emits('close')">
        <svg-icon icon-class="close"
            :style="{ width: size ? `${size}px` : '18px', height: size ? `${size}px` : '18px' }"></svg-icon>
    </div>
</template>
<script setup lang="ts">
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
    padding: 4px;
    margin: 2px 0 0 0;

    &:hover {
        background-color: #f3f0ff;
        border-radius: 3px;
        cursor: pointer;

        >svg {
            fill: #9775fa;
        }
    }

    &:active>svg {
        transform: scale(0.9);
    }
}
</style>
