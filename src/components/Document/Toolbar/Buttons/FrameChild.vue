<script setup lang="ts">
import { defineEmits, defineProps } from 'vue';
import { WorkSpace } from "@/context/workspace";


const props = defineProps<{
    childFrame: boolean,
    top: number,
    left: number,
    framesChild: string[][],
    workspace: WorkSpace
}>();
const emit = defineEmits<{
  (e: "closeFrame"): void;
}>();

const addFrame = (size: string) => {
  const width = Number(size.split('×')[0])
  const height = Number(size.split('×')[1])
  emit('closeFrame')
  props.workspace.setFrameSize({width: width, height: height})
  
}

</script>
<template>
    <div class="child" v-if="childFrame" :style="{top: top+ 'px', left: props.left+'px'}">
          <div class="item" v-for="(item, i) in props.framesChild" :key="i" @click="addFrame(item[1])">
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