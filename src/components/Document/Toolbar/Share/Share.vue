<script setup lang="ts">
import { onMounted, ref, onUnmounted, defineProps } from 'vue';
import FileShare from './FileShare.vue';
import { Context } from '@/context';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

const { t } = useI18n()
interface Props {
    context: Context
}
const route = useRoute()
const docID = route.query.id || localStorage.getItem('docId')
const props = defineProps<Props>();
const showFileShare = ref<boolean>(false);
const pageHeight = ref(0)
const shareSwitch = ref(true)
const selectValue = ref(1)
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
const onSwitch = (state: boolean) => {
  shareSwitch.value = state
  
}
const onSelectType = (type: number) => {
  selectValue.value = type
}

// 实时获取页面的高度
const getPageHeight = () => {
  pageHeight.value = window.innerHeight
}

onMounted(() => {
  getPageHeight()
  props.context.documentInfo((docID as string)).then((res) => {
    if(res.document) {
      selectValue.value = res.document.doc_type !== 0 ? res.document.doc_type : res.document.doc_type
    }
  })
  window.addEventListener('resize', getPageHeight);
})
onUnmounted(() => {
  window.removeEventListener('resize', getPageHeight);
})
</script>

<template>
  <div class="container" @dblclick.stop>
    <div class="share" @click.stop="onShare">
      <svg-icon class="svg" icon-class="share"></svg-icon>
    </div>
    <FileShare v-if="showFileShare" @close="closeShare" :shareSwitch="shareSwitch" :selectValue="selectValue" @select-type="onSelectType" @switch-state="onSwitch" :pageHeight="pageHeight"></FileShare>
  </div>
</template>

<style scoped lang="scss">
.container {
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
