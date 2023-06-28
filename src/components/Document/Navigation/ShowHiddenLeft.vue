<script lang="ts" setup>
const props = defineProps<{ leftTriggleVisible: boolean, showLeft: boolean }>();
const emit = defineEmits<{ (e: 'showNavigation'): void }>()
const showHiddenLeft = () => {
    emit('showNavigation')
}

</script>

<template>
    <div class="showHiddenL" @click="showHiddenLeft" v-if="!showLeft || leftTriggleVisible"
        :style="{ opacity: showLeft ? 1 : 0.6 }">
        <svg-icon v-if="showLeft" class="svg" icon-class="left"></svg-icon>
        <svg-icon v-else class="svg" icon-class="right"></svg-icon>
    </div>
</template>

<style lang="scss" scoped>
    .showHiddenL {
        position: absolute;
        right: -12px;
        top: 50%;
        transform: translateY(-50%);
        z-index: 9;
        cursor: pointer;
        height: 60px;
        background-color: var(--theme-color-anti);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 0 4px 4px 0;
        box-shadow: 4px 0px 4px rgba($color: #000000, $alpha: 0.05);

        >.svg {
            width: 12px;
            height: 12px;
        }
    }
</style>