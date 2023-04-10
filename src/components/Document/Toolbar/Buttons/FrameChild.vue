<script setup lang="ts">
import { left } from '@popperjs/core';
import { defineEmits, defineProps, onMounted, onUpdated } from 'vue';

const props = defineProps<{
    childFrame: boolean,
    top: number,
    left: number,
    framesChild: string[][]
}>();
const emit = defineEmits<{
}>();

</script>
<template>
    <div class="child" v-if="childFrame" :style="{top: top+ 'px', left: props.left+'px'}">
          <div class="item" v-for="(item, i) in props.framesChild" :key="i">
            <span>{{ item[0] }}</span>
            <span>{{ item[1] }}</span>
          </div>
        </div>
</template>
<style scoped lang="scss">
.child {
        position: absolute;
        width: 200px;
        height: auto;
        z-index: 999;
        color: #ffffff;
        font-size: var(--font-default-fontsize);
        background-color: var(--theme-color);
        border-radius: 4px;
        outline: none;
        padding: var(--default-padding-half) 0;
        .item {
          width: 100%;
          box-sizing: border-box;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 4px var(--default-padding);
        }
        .item:hover {
            background-color: var(--active-color);
        }
      }
</style>