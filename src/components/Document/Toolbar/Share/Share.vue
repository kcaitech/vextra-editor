<script setup lang="ts">
import { onMounted, ref, onUnmounted, defineProps, watch } from 'vue';
import FileShare from './FileShare.vue';
import { Context } from '@/context';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import * as share_api from '@/apis/share';

const { t } = useI18n()
interface Props {
  context: Context
}
const route = useRoute()
const docID = (route.query.id as string)
const props = defineProps<Props>();
const showFileShare = ref<boolean>(false);
const pageHeight = ref(0)
const shareSwitch = ref(true)
const selectValue = ref(1)
const onShare = () => {
  if (showFileShare.value) {
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
async function documentInfo(id: string) {
  try {
    if (id) {
      const { data } = await share_api.getDocumentInfoAPI({ doc_id: id })
      return data
    } else {
      console.log('没有该文档');
    }

  } catch (err) {
    return console.log(err);
  }
}

// 实时获取页面的高度
const getPageHeight = () => {
  pageHeight.value = window.innerHeight
}
const getSelectValue = (val: string) => {
  documentInfo(val).then((res: any) => {
    if (res.document) {
      selectValue.value = res.document.doc_type !== 0 ? res.document.doc_type : res.document.doc_type
    }
  })
}
watch(() => route.query.id, (val) => {
  getSelectValue((val as string))
})

onMounted(() => {
  getPageHeight()
  route.query.id && getSelectValue((route.query.id as string))
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
    <FileShare v-if="showFileShare" @close="closeShare" :shareSwitch="shareSwitch" :selectValue="selectValue"
      @select-type="onSelectType" @switch-state="onSwitch" :pageHeight="pageHeight"></FileShare>
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
