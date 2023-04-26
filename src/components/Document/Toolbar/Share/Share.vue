<script setup lang="ts">
import { ref } from 'vue';
import FileShare from './FileShare.vue';
const showFileShare = ref<boolean>(false);
const onShare = () => {
  if(showFileShare.value) {
    showFileShare.value = false
    return
  }
  showFileShare.value = true
}
const closeShare = () => {
  showFileShare.value = false
}
</script>

<template>
  <div class="container" @dblclick.stop>
    <div class="share" @click.stop="onShare">
      <svg-icon class="svg" icon-class="share"></svg-icon>
    </div>
    <FileShare v-if="showFileShare" @close="closeShare"></FileShare>
  </div>
</template>

<style scoped lang="scss">
.container {
  position: relative;

  .share {
    cursor: pointer;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    >svg {
      width: 80%;
      height: 80%;
      color: #fff;
    }
  }
}
</style>
