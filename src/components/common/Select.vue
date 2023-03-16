<script setup lang="ts">
import { ref } from 'vue';
const isShowOptions = ref<boolean>(false);
const popover = ref<HTMLDivElement>();
const popoverVisible = ref<boolean>();
function toggle() {
    isShowOptions.value = !isShowOptions.value;
}

</script>

<template>
    <div class="select-container">
        <div class="input"></div>
        <div class="toggle" @click="toggle">
            <svg-icon
                icon-class="down"
                :style="{
                    transition: '0.3s',
                    transform: isShowOptions ? 'rotate(-180deg)' : 'rotate(0deg)'
                }"
            ></svg-icon>
        </div>
        <div class="popover" tabindex="-1" ref="popover" v-if="popoverVisible">

        </div>
    </div>
</template>

<style scoped lang="scss">
.select-container {
    position: relative;
    border-radius: var(--default-radius);
    background-color: rgba(216, 216, 216, 0.4);
    height: 28px;
    min-width: 48px;
    padding: 0px var(--default-padding-half);
    display: flex;
    align-items: center;
    > .input {
        flex: 1 1 auto;
    }
    > .toggle {
        flex: 0 0 16px;
        height: 16px;
        display: flex;
        justify-content: center;
        align-items: center;
        > svg {
            width: 70%;
            height: 70%;
        }
    }
}
</style>