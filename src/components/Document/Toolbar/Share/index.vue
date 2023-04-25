<script setup lang="ts">
import {ref} from 'vue';
import fileShare from './fileShare.vue';
type ShareEl = InstanceType<typeof fileShare>
const showFileShare = ref(false)
const fileShareEl = ref<ShareEl>()
const onShare = (e: Event) => {
  e.stopPropagation()
  showFileShare.value = true
}
const closeShare = () => {
  showFileShare.value = false
}
</script>

<template>
  <div class="container">
    <div class="share" @click="onShare">
        <svg-icon class="svg" icon-class="share"></svg-icon>
    </div>
    <fileShare v-if="showFileShare" ref="fileShare" @close="closeShare"></fileShare>
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
        > svg {
            width: 80%;
            height: 80%;
            color: #fff;
        }
    }
  }
    
</style>
