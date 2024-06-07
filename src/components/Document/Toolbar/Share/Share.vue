<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
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

async function documentInfo(id: any) {
  try {
    if (id) {
      const { data } = await share_api.getDocumentInfoAPI({ doc_id: id })
      docInfo.value = data;
      if (data.project) {
        GetprojectLists(data.project.id);
      } else {
        perm.value = true;
      }
      return data
    } else {
      console.log(t('share.no_document'));
    }
  } catch (err) {
    return console.error(err); // 这里return了个undefined
  }
}

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

watch(() => route.query.id, () => {
  documentInfo(route.query.id)
})

onMounted(() => {
  documentInfo(docID);
})
</script>

<template>
  <div class="container" @dblclick.stop>
    <button class="share" @click.stop="onShare">{{ t('home.share') }}</button>
  </div>
  <Teleport to="body">
    <div v-if="showFileShare" class="overlay">
      <FileShare @close="closeShare" :docId="docID" :projectPerm="projectPerm"></FileShare>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
.overlay {
  position: absolute;
  display: flex;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
  background-color: transparent;
}

.container {
  margin: auto 0 auto 8px;

  &:hover {
    filter: brightness(1.1);
  }

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
