<script lang="ts" setup>
import { ref, reactive, defineProps } from 'vue'

const curValue = ref<string>();
const props = defineProps<{
    source?: Array<any>,
    itemView?: any,
    itemWidth?: number,
    itemHeight?: number,
    firstIndex?: number,
    orientation?: "horizontal" | "vertical",
    location?: string,
    allowDrag?: boolean,
    width: string
}>();
const options = ref<HTMLDivElement>();
const optionsVisible = ref<boolean>(false);
function toggle() {
    optionsVisible.value = !optionsVisible.value
}
</script>
<template>
<div class="select-container">
    <div class="trigger" @click="toggle">
        <div class="value-wrap"></div>
        <div class="svg-wrap">
            <svg-icon icon-class="down"></svg-icon>
        </div>
    </div>
    <div class="options" ref="options" tabindex="-1" v-if="optionsVisible"></div>
</div>
</template>
<style scoped lang="scss">
.select-container {
    position: relative;
    .trigger {
        position: relative;
        display: flex;
        align-items: center;
        .value-wrap {
            flex: 1 1 auto;
            height: 100%;
        }
        > .svg-wrap {
            height: 100%;
            flex: 0 0 24px;
            display: flex;
            align-items: center;
            > svg {
                width: 10px;
                height: 10px;
                transition: 0.3s;
            }
        }
        > .svg-wrap:hover {
            > svg {
                transform: translateY(4px);
            }
        }
    }
    .trigger {
        width: 120px;
        height: 32px;
        background-color: var(--input-background);
        border-radius: var(--default-radius);
    }
    .options {
        position: absolute;
        width: 160px;
        height: 100;
        background-color: antiquewhite;
    }
}
</style>