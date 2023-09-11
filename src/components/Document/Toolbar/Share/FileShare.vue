<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, reactive, watch, watchEffect, } from 'vue';
import { useI18n } from 'vue-i18n';
import { UserInfo } from '@/context/user';
import { Context } from '@/context';
import * as share_api from '@/apis/share';
import { ElMessage } from 'element-plus';
import { useRoute } from 'vue-router';
import { DocInfo } from "@/context/user"
const { t } = useI18n()
const props = defineProps<{
  pageHeight: number,
  shareSwitch: boolean,
  docId?: string,
  selectValue: number,
  docUserId?: string,
  context?: Context,
  userInfo: UserInfo | undefined,
  docInfo?: DocInfo,
  project?: boolean
}>()
const emit = defineEmits<{
  (e: 'close'): void,
  (e: 'switchState', nVal: boolean): void,
  (e: 'selectType', nVal: number): void
}>()
enum permissions {
  noAuthority,
  readOnly,
  reviewable,
  editable
}
const route = useRoute()
const docID = props.docId ? props.docId : route.query.id
const url = route.path !== '/document' ? `https://protodesign.cn/#/document?id=${docID}` : location.href

const value1 = ref(props.shareSwitch)
const authority = ref(false)
const docInfo = ref<DocInfo>(props.docInfo!)
const index = ref(0)
const card = ref<HTMLDivElement>()
const editable = ref(`${t('share.editable')}`)
const reviewable = ref(`${t('share.reviewable')}`)
const readOnly = ref(`${t('share.readOnly')}`)
const remove = ref(`${t('share.remove')}`)
const founder = ref(false)
const userInfo = ref<UserInfo | undefined>(props.userInfo)
const shareList = ref<any[]>([])

const handleTop = ref<number>()
const posi = ref({
  top: 0,
  left: 0
})
enum docType {
  Private,
  Share,
  Read,
  Critical,
  Edit
}
const popover = ref<HTMLDivElement>()
const options = [
  {
    value: 0,
    label: `${t('share.need_to_apply_for_confirmation')}`
  },
  {
    value: 1,
    label: `${t('share.anyone_can_read_it')}`
  },
  {
    value: 2,
    label: `${t('share.anyone_can_comment')}`
  },
  {
    value: 3,
    label: `${t('share.anyone_can_edit_it')}`
  }
]

const DocType = reactive([`${t('share.shareable')}`, `${t('share.need_to_apply_for_confirmation')}`, `${t('share.anyone_can_read_it')}`, `${t('share.anyone_can_comment')}`, `${t('share.anyone_can_edit_it')}`])
const permission = reactive([`${t('share.no_authority')}`, `${t('share.readOnly')}`, `${t('share.reviewable')}`, `${t('share.editable')}`])
const selectValue = ref(DocType[props.selectValue])

const closeShare = (e: MouseEvent) => {
  e.stopPropagation()
  emit('close')
}
const handleClick = (e: MouseEvent) => {
  e.stopPropagation()
  e.target instanceof Element && !e.target.closest('.box-card') && emit('close');
  if (e.target instanceof Element && !e.target.closest('.popover')) {
    authority.value = false
  }
}
const getDocumentInfo = async () => {
  try {
    const { data } = await share_api.getDocumentInfoAPI({ doc_id: docID })
    if (data) {
      docInfo.value = data  
    }
  } catch (err) {
    console.log(err);
  }
}

const selectAuthority = (i: number, e: Event) => {
  e.stopPropagation()
  if (authority.value) {
    authority.value = false
    return
  }
  index.value = i
  authority.value = true
  const el = (e.target as HTMLDivElement)
  nextTick(() => {
    posi.value.top = Math.max(el.parentElement!.offsetHeight, 35) * (i + 2)
  })
}
const onEditable = (id: any, type: number, index: number) => {
  putShareAuthority(id, type)
  shareList.value[index].document_permission.perm_type = type
}
const onReviewable = (id: any, type: number, index: number) => {
  putShareAuthority(id, type)
  shareList.value[index].document_permission.perm_type = type
}
const onReadOnly = (id: string, type: number, index: number) => {
  putShareAuthority(id, type)
  shareList.value[index].document_permission.perm_type = type
}
const onRemove = (id: string, i: number) => {
  delShare(id)
  shareList.value.splice(i, 1)
}
const getShareList = async () => {
  try {
    const { data } = await share_api.getShareListAPI({ doc_id: docID })
    if (data) {
      shareList.value = data
      console.log(shareList.value+'11111');
      
    }
  } catch (err) {
    console.log(err);
  }
}
const delShare = async (id: string) => {
  try {
    await share_api.delShareAuthorityAPI({ share_id: id })
    getShareList()
  } catch (err) {
    console.log(err);
  }
}
const putShareAuthority = async (id: string, type: number) => {
  try {
    await share_api.putShareAuthorityAPI({ share_id: id, perm_type: type })
    getShareList()
  } catch (err) {
    console.log(err);
  }
}
const setShateType = async (type: number) => {
  try {
    await share_api.setShateTypeAPI({ doc_id: docID, doc_type: type })
    for (let i = 0; i < shareList.value.length; i++) {
      if (type === 1) {
        return
      } else if (shareList.value[i].document_permission.perm_source_type === 0) {
        shareList.value[i].document_permission.perm_type = type - 1
      }
    }
  } catch (err) {
    console.log(err);
  }
}

watch(selectValue, (nVal, oVal) => {
  if (value1.value) {
    const index = DocType.findIndex(item => item === nVal)
    if (index === docType.Critical) {
      setShateType(docType.Critical)
    } else if (index === docType.Edit) {
      setShateType(docType.Edit)
    } else if (index === docType.Read) {
      setShateType(docType.Read)
    } else if (index === docType.Share) {
      setShateType(docType.Share)
    }
    emit('selectType', index)
  }
})
watch(value1, (nVal, oVal) => {
  if (nVal) {
    if (props.selectValue === docType.Critical) {
      setShateType(docType.Critical)
    } else if (props.selectValue === docType.Edit) {
      setShateType(docType.Edit)
    } else if (props.selectValue === docType.Read) {
      setShateType(docType.Read)
    } else if (props.selectValue === docType.Share) {
      setShateType(docType.Share)
    }
    emit('switchState', nVal)
  } else {
    setShateType(docType.Private)
    emit('switchState', nVal)
  }
})

watchEffect(() => {
  if (route.query.id) {
    const userId = props.userInfo?.id
    if (props.docUserId) {
      props.docUserId != userId ? founder.value = true : founder.value = false
    } else if (props.docInfo) {
      props.docInfo.user.id != userId ? founder.value = true : founder.value = false
    }
  }else {
    const userId = props.userInfo?.id
    if (props.docUserId) {
      props.docUserId != userId ? founder.value = true : founder.value = false
    } else if (props.docInfo) {
      props.docInfo.user.id != userId ? founder.value = true : founder.value = false
    }
  }
})

const copyLink = async () => {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(url).then(() => {
      ElMessage({
        message: `${t('share.copy_success')}`,
        type: 'success',
      })
    }, () => {
      ElMessage({
        message: `${t('share.copy_failure')}`,
        type: 'success',
      })
    })
  } else {
    const textArea = document.createElement('textarea')
    textArea.value = url
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    document.execCommand('copy')
    ElMessage({
      message: `${t('share.copy_success')}`,
      type: 'success',
    })
    textArea.remove()
  }
}
handleTop.value = props.pageHeight / 2
watch(() => props.pageHeight, () => {
  handleTop.value = props.pageHeight / 2
  nextTick(() => {
    if (card.value) {
      let el = card.value
      el.style.top = Math.max(handleTop.value!, el.offsetHeight / 2) + 'px'
    }
  })
})
watchEffect(() => {
  getDocumentInfo()
  getShareList()
  nextTick(() => {
    handleTop.value = props.pageHeight / 2
    if (card.value) {
      let el = card.value
      el.style.top = Math.max(handleTop.value!, el.offsetHeight / 2) + 'px'
    }
  })
})

onMounted(() => {
  if (!value1.value) {
    setShateType(docType.Private)
  } else {
    if (props.selectValue === docType.Critical) {
      setShateType(docType.Critical)
    } else if (props.selectValue === docType.Edit) {
      setShateType(docType.Edit)
    } else if (props.selectValue === docType.Read) {
      setShateType(docType.Read)
    } else if (props.selectValue === docType.Share) {
      setShateType(docType.Share)
    }
  }
  document.addEventListener('click', handleClick);
})

onUnmounted(() => {
  document.removeEventListener('click', handleClick);
})

</script>
<template>
  <div ref="card" class="card" :style="{ top: props.pageHeight / 2 }">
    <el-card class="box-card" :style="{ width: 400 + 'px' }" v-if="!founder && docInfo">
      <!-- 标题 -->
      <template #header>
        <div class="card-header">
          <span>{{ t('share.file_sharing') }}</span>
          <el-button class="button" text @click="closeShare">
            <div class="close"> X </div>
          </el-button>
        </div>
      </template>
      <!-- 内容 -->
      <div class="contain">
        <!-- 开关 -->
        <div class="share-switch">
          <span>{{ t('share.share_switch') }}:</span>
          <el-switch class="switch" size="small" v-model="value1" />
        </div>
        <!-- 文件名 -->
        <div class="file-name">
          <span style="margin-right: 12px;">{{ t('share.file_name') }}:</span>
          <p class="name">{{ docInfo!.document.name }}</p>
        </div>
        <!-- 权限设置 -->
        <div class="purview">
          <span>{{ t('share.permission_setting') }}:</span>
          <el-select v-model="selectValue" style="width: 180px;" class="m-2">
            <el-option style="font-size: 10px;" class="option" v-for="item in options" :key="item.value"
              :label="item.label" :value="item.label" />
          </el-select>
          <el-button color="#0d99ff" size="small" @click="copyLink">{{ t('share.copy_link') }}</el-button>
        </div>
        <!-- 分享人 -->
        <div>
          <span>{{ t('share.people_who_have_joined_the_share') }} ({{ t('share.share_limit') }}5) :</span>
          <el-scrollbar height="300px" class="shared-by">
            <div class="scrollbar-demo-item">
              <div class="item-left">
                <div class="avatar"><img :src="docInfo.user.avatar"></div>
                <div class="name">{{ docInfo.user.nickname }}</div>
              </div>
              <div class="item-right">
                <div class="founder">{{ t('share.founder') }}</div>
              </div>
            </div>
            <div v-for="(item, ids) in shareList" :key="ids" class="scrollbar-demo-item">
              <div class="item-left">
                <div class="avatar"><img :src="item.user.avatar"></div>
                <div class="name">{{ item.user.nickname }}</div>
              </div>
              <div class="item-right" @click="(e: Event) => selectAuthority(ids, e)">
                <div class="authority">{{ permission[item.document_permission.perm_type] }}</div>
                <div class="svgBox"><svg-icon class="svg" icon-class="bottom"></svg-icon></div>
                <div class="popover" v-if="authority && index === ids" ref="popover"
                  :style="{ top: posi.top - 8 + 'px', right: 30 + 'px' }">
                  <div @click="onEditable(item.document_permission.id, permissions.editable, ids)">{{ editable }}</div>
                  <div @click="onReviewable(item.document_permission.id, permissions.reviewable, ids)">{{ reviewable }}
                  </div>
                  <div @click="onReadOnly(item.document_permission.id, permissions.readOnly, ids)">{{ readOnly }}</div>
                  <div @click="onRemove(item.document_permission.id, ids)">{{ remove }}</div>
                </div>
              </div>
            </div>
          </el-scrollbar>
          <div class="project" v-if="project">项目中所有成员均可访问</div>
        </div>
      </div>
    </el-card>

    <el-card class="box-card" :style="{ width: 300 + 'px' }" v-if="founder && docInfo">
      <!-- 标题 -->
      <template #header>
        <div class="card-header">
          <span>{{ t('share.file_sharing') }}</span>
          <el-button class="button" text @click="closeShare">
            <div class="close"> X </div>
          </el-button>
        </div>
      </template>
      <div class="contain">
        <!-- 文件名 -->
        <div class="unfounder">
          <span>{{ t('share.file_name') }}:</span>
          <p class="name">{{ docInfo!.document.name }}</p>
        </div>
        <!-- 创建者 -->
        <div class="unfounder">
          <span>{{ t('share.founder') }}:</span>
          <p class="name">{{ docInfo!.user.nickname }}</p>
        </div>
        <!-- 文档权限 -->
        <div class="unfounder">
          <span>{{ t('share.document_permission') }}:</span>
          <p class="name">{{ DocType[docInfo.document.doc_type] }}</p>
        </div>
        <div class="project" v-if="project">项目中所有成员均可访问</div>
        <!-- 链接按钮 -->
        <div class="button bottom">
          <el-button color="#0d99ff" @click="copyLink">{{ t('share.copy_link') }}</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>
  
<style scoped lang="scss">
.project {
  opacity: .5;
  display: flex;
  justify-content: center;
  margin-bottom: 5px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  span {
    font-weight: var(--font-default-bold);
  }

  .close {
    font-size: 16px;
    color: black;
  }

}

:deep(.el-card__header) {
  border-bottom: none;
  padding: var(--default-padding);
  padding-bottom: 0;
}

:deep(.el-card__body) {
  padding: var(--default-padding-half) var(--default-padding)
}

:deep(.el-input) {
  font-size: var(--font-default-fontsize);
}

.contain {
  font-size: var(--font-default-fontsize);

  .share-switch {
    margin: var(--default-margin-half) 0;
  }

  .switch {
    --el-switch-on-color: var(--active-color);
    margin-left: 10px;

  }

  .bottom {
    margin: 5px 0 var(--default-margin) 0;
  }
}

.file-name {
  margin: var(--default-margin-half) 0;
  display: flex;
  align-items: center;

  .name {
    margin-left: 10px;
  }
}

.m-2 {
  margin-left: 10px;
  margin-right: 5px;
}

.scrollbar-demo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 35px;

  .item-left {
    display: flex;
    align-items: center;
    margin-left: var(--default-margin);
    position: relative;
    height: 100%;

    .avatar {
      height: 25px;
      width: 25px;
      border-radius: 50%;
      margin-right: 10px;

      >img {
        height: 100%;
        width: 100%;
        border-radius: 50%;
      }
    }
  }

  .item-right {
    display: flex;
    align-items: center;
    height: 100%;

    .svgBox {
      height: 10px;
      width: 10px;
      display: flex;
      margin-left: 8px;
      margin-right: 30px;
      justify-content: center;
      align-items: center;
      cursor: pointer;

      >.svg {
        height: 10px;
        width: 10px;
      }
    }
  }
}

.purview {
  margin: var(--default-margin-half) 0 var(--default-margin) 0
}

.shared-by {
  margin: var(--default-margin-half) 0 var(--default-margin) 0;
  border: 2px solid var(--theme-color-line);
}

.popover {
  position: absolute;
  display: flex;
  border: 1px solid var(--theme-color-line);
  font-size: var(--font-default-fontsize);
  background-color: #fff;
  border-radius: 4px;
  flex-direction: column;
  width: 100px;
  justify-content: space-around;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
  >div {
    padding: var(--default-margin-quarter) var(--default-padding-half);
  }

  >div:hover {
    background-color: #f5f7fa
  }
}

.unfounder {
  display: flex;
  align-items: center;

  >.name {
    margin-left: 10px;
  }
}

.button {
  display: flex;
  align-items: center;
  justify-content: center;
}

.founder {
  margin-right: 48px;
}

.card {
  position: fixed;
  z-index: 1000;
  left: 50%;
  transform: translate(-50%, -50%);
}

.box-card {
  width: 400px;
}
:deep(.el-button) {
  background-color: #9775fa;
}
</style>