<script setup lang="ts">
import { Context } from '@/context';
import { } from 'vue';


const props = defineProps<{
  childFrame: boolean,
  top: number,
  left: number,
  framesChild: string[][],
  context: Context
}>();
const emit = defineEmits<{
  (e: "closeFrame"): void;
}>();

const addFrame = (t: string[]) => {
  if (t.length === 2) {
    const width = Number(t[1].split('×')[0])
    const height = Number(t[1].split('×')[1])
    emit('closeFrame')
    props.context.tool.setArtboardTemp(width, height, t[0]);
  }
}

</script>
<template>

  <div class="child" v-if="childFrame" :style="{ top: top + 'px', left: props.left -4 + 'px' }">
    <div class="item" v-for="(item, i) in props.framesChild" :key="i" @click="addFrame(item)">
      <span>{{ item[0] }}</span>
      <span>{{ item[1] }}</span>
    </div>
  </div>
</template>
<style scoped lang="scss">
.child {
  position: absolute;
  width: 222px;
  height: auto;
  z-index: 999;
  color: #ffffff;
  font-size: var(--font-default-fontsize);
  background-color: #262626;
  border-radius: 4px;
  outline: none;
  padding: 4px 0;

  .item {
    width: 100%;
    box-sizing: border-box;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 9px 16px;
  }

  .item:hover {
    background-color: #434343;
  }
}
</style>