<script lang="ts" setup>
defineProps<{ leftTriggleVisible: boolean, showLeft: boolean, rule: boolean }>();
const emit = defineEmits<{ (e: 'showNavigation'): void }>()
const showHiddenLeft = () => {
    emit('showNavigation')
}


</script>

<template>
    <div class="showHiddenL" @click="showHiddenLeft"
        v-if="!showLeft || leftTriggleVisible"
        :style="{ opacity: showLeft ? 1 : 0.6, right: rule ? '-36px' : '-16px' }">
        <svg-icon v-if="showLeft" class="svg" icon-class="left"></svg-icon>
        <svg-icon v-else class="svg" icon-class="right"></svg-icon>
    </div>
</template>

<style lang="scss" scoped>
.showHiddenL {
    position: absolute;
    // right: -16px;
    top: 0%;
    transform: translateY(-50%);
    z-index: 9;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    //box-shadow: 4px 0px 4px rgba($color: #000000, $alpha: 0.05);
    border-radius: 0px 8px 8px 0px;
    background: #FFFFFF;
    width: 16px;
    height: 44px;
    box-sizing: border-box;
    border: 1px solid #F0F0F0;
    padding: 14px 0;

    >.svg {
        width: 16px;
        height: 16px;
    }
}
</style>