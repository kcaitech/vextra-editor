<script setup lang="ts">
import { onMounted, ref, onUnmounted, watch, watchEffect } from 'vue';
import FileShare from './FileShare.vue';
import { Context } from '@/context';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { UserInfo, DocInfo } from '@/context/user';
import * as share_api from '@/request/share';
import * as team_api from '@/request/team'

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
const userInfo = ref<UserInfo | undefined>()
const docInfo = ref<DocInfo>()
const projectPerm = ref()
const perm = ref(false)
const onShare = () => {
  if (showFileShare.value) {
    showFileShare.value = false
    return
  }
  if (docInfo.value && perm.value) {
    userInfo.value = props.context.comment.isUserInfo
    showFileShare.value = true
  }
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
async function documentInfo(id: any) {
  try {
    if (id) {
      const { data } = await share_api.getDocumentInfoAPI({ doc_id: id })
      docInfo.value = data;
      if(data.project) {
        GetprojectLists(data.project.id);
      }else {
        perm.value = true;
      }
      return data
    } else {
      console.log(t('share.no_document'));
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
watchEffect(() => {
  route.query.id;
  if(route.query.id) {
    getSelectValue((route.query.id as string))
  }
})

const GetprojectLists = async (id: string) => {
  try {
    const { data } = await team_api.GetprojectLists()
    if (data) {
      perm.value = true;
      const project = data.filter((item: any) => item.project.id === id)[0];
      projectPerm.value = project.self_perm_type;
    }

  } catch (err) {
    console.log(err);
  }
}

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
    <button class="share" @click.stop="onShare">分享
<!--      <svg-icon class="svg" icon-class="share-icon"></svg-icon>-->
    </button>
    <FileShare v-if="showFileShare" @close="closeShare" :shareSwitch="shareSwitch" :selectVaFlue="selectValue"
      :docInfo="docInfo" :projectPerm="projectPerm" @select-type="onSelectType" @switch-state="onSwitch"
      :pageHeight="pageHeight" :context="props.context" :userInfo="userInfo"></FileShare>
  </div>
</template>

<style scoped lang="scss">
.container {
  .share {
    cursor: pointer;
    width: 56px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    background: #1878F5;
      font-size: 13px;
      color: #FFFFFF;
      border: none;
      font-family: HarmonyOS Sans;
      font-feature-settings: "kern" on;
      padding: 9px 15px 8px 15px;
    //>svg {
    //  width: 20px;
    //  height: 20px;
    //  color: #fff;
    //}
  }
}
</style>
