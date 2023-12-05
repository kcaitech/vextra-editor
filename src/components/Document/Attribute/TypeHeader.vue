<script setup lang="ts">
import {ref} from 'vue';
import { Context } from '@/context';
import { Shape } from '@kcdesign/data';
const props = defineProps<{
    context?: Context,
    shape?: Shape,
    title: string,
    active: boolean
}>();
// const changeTitleColor = () => {
//     if (titleElement.value) {
//         titleElement.value.classList.toggle('blue-title');
//     }
// };
// const titleElement = ref<HTMLElement | null>(null);
</script>

<template>
    <div class="header-container">
        <div class="header">
            <div class="title" :class="{'checked': active}">{{ props.title }}</div>
            <div class="space"></div>
            <div class="tool">
                <slot name="tool"></slot>
            </div>
        </div>
<!--        <div class="line" />-->
    </div>
    
</template>

<style scoped lang="scss">
.header-container {
    width: 100%;
    min-height: 32px;
    box-sizing: border-box;
    position: relative;

    .header {
        display: flex;
        flex-direction: row;
        align-items: center;
        flex: 1 auto 1;
        justify-content: flex-start;
        > .title {
            flex-shrink: 0;
            height: 14px;
            font-family: HarmonyOS Sans;
            font-size: 12px;
            font-weight: normal;
            font-feature-settings: "kern" on;
            color: #737373;
        }
        .checked {
            color: #000000;
        }
        > .space {
            width: 178px;
        }
        //.blue-title {
        //    color: blue;
        //}
    }
    > .header + .line {
        margin-top: 4px;
        margin-left: -10px;
        width: 250px;
        height: 1px;
        background-color: var(--theme-color-line);
        flex: 0 0 auto;
    }
}
</style>