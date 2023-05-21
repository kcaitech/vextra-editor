<script setup lang="ts">
import { defineEmits, ref, onMounted, onUnmounted, nextTick, reactive, watch, watchEffect, defineProps } from 'vue';
import { useI18n } from 'vue-i18n';
import { User } from '@/context/user';
import * as share_api from '@/apis/share';
import { ElMessage } from 'element-plus';
import { useRoute } from 'vue-router';
import { DocInfo } from "@/context/user"
const { t } = useI18n()
const props = defineProps<{
  pageHeight: number,
  shareSwitch: boolean
}>()
const emit = defineEmits<{
  (e: 'close'): void,
  (e: 'switchState', nVal: boolean): void
}>()
enum permissions {
  noAuthority,
  readOnly,
  reviewable,
  editable
}
const route = useRoute()
const docID = localStorage.getItem('docId')
const url = route.query.id ? location.href : location.href + `?id=${docID}`

const value1 = ref(props.shareSwitch)
const selectValue = ref(`${t('share.need_to_apply_for_confirmation')}`)
const authority = ref(false)
const docInfo = ref<DocInfo>()
const index = ref(0)
const card = ref<HTMLDivElement>()
const editable = ref(`${t('share.editable')}`)
const readOnly = ref(`${t('share.readOnly')}`)
const remove = ref(`${t('share.remove')}`)
const founder = ref(false)
const userInfo = ref<User>()
let shareList: any = ref([])

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
    value: `${t('share.need_to_apply_for_confirmation')}`,
    label: `${t('share.need_to_apply_for_confirmation')}`
  },
  {
    value: `${t('share.anyone_can_read_it')}`,
    label: `${t('share.anyone_can_read_it')}`
  },
  {
    value: `${t('share.anyone_can_edit_it')}`,
    label: `${t('share.anyone_can_edit_it')}`
  },
  {
    value: `${t('share.anyone_can_comment')}`,
    label: `${t('share.anyone_can_comment')}`
  }
]
const DocType = reactive([`${t('share.shareable')}`, `${t('share.need_to_apply_for_confirmation')}`, `${t('share.anyone_can_read_it')}`, `${t('share.anyone_can_comment')}`, `${t('share.anyone_can_edit_it')}`])
const permission = reactive([`${t('share.no_authority')}`, `${t('share.readOnly')}`, `${t('share.reviewable')}`, `${t('share.editable')}`])
userInfo.value = ((window as any).skuser as User);

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
const getDocumentInfo = async() => {
  try {
    const {data} = await share_api.getDocumentInfoAPI({doc_id: docID})
    if(data) {
      docInfo.value = data
    }
  }catch(err) {
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
const onEditable = (id: string, type: number, index: number) => {
  if(shareList.value[index].perm_type === type) return
  putShareAuthority(id, type)
  shareList.value[index].perm_type = type
}
const onReadOnly = (id: string, type: number, index: number) => {
  if(shareList.value[index].perm_type === type) return
  putShareAuthority(id, type)
  shareList.value[index].perm_type = type
}
const onRemove = (id: string, i: number) => {
  delShare(id)
  shareList.value.splice(i, 1)
}
const getShareList = async () => {
  try {
    const { data } = await share_api.getShareListAPI({ doc_id: docID })
    shareList.value = data
  } catch(err) {
    console.log(err);
  }
}
const delShare = async (id: string) => {
  try {
    await share_api.delShareAuthorityAPI({ share_id: id })
    getShareList()
  }catch(err) {
    console.log(err);
  }
}
const putShareAuthority = async (id: string, type: number) => {
  try {
    await share_api.putShareAuthorityAPI({ share_id: id, perm_type: type })
  }catch(err) {
    console.log(err);
  }
}
const setShateType = async (type: number) => {
  try {
    await share_api.setShateTypeAPI({ doc_id: docID, doc_type: type })
  }catch(err) {
    console.log(err);
  }
}

// watch(selectValue, (nVal, oVal) => {
//   if (nVal == DocType[docType.Critical]) {
//     setShateType(docType.Critical)
//   } else if (nVal == DocType[docType.Edit]) {
//     setShateType(docType.Edit)
//   }else if (nVal == DocType[docType.Read]) {
//     setShateType(docType.Read)
//   } else if (nVal == DocType[docType.Share]) {
//     setShateType(docType.Share)
//   }
// })
watch(value1, (nVal, oVal) => {
  if(nVal) {
    if(selectValue.value == DocType[docType.Critical]) {
      setShateType(docType.Critical)
    }else if(selectValue.value == DocType[docType.Edit]){
      setShateType(docType.Edit)
    }else if(selectValue.value == DocType[docType.Read]){
      setShateType(docType.Read)
    }else if(selectValue.value == DocType[docType.Share]){
      setShateType(docType.Share)
    }
    emit('switchState', nVal)
  }else {
    setShateType(docType.Private)
    emit('switchState', nVal)
  }
})

watchEffect(() => {
  if(route.query.id) {
    if(docInfo.value) {
      console.log(userInfo.value?.userInfo.id,'id');
      
      docInfo.value.user.id !== userInfo.value?.userInfo.id ? founder.value = true : founder.value = false
    }
  }
})

const copyLink = async() => {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(url).then(() => {
      if(value1.value) {
        if(selectValue.value == DocType[docType.Critical]) {
          setShateType(docType.Critical)
        }else if(selectValue.value == DocType[docType.Edit]){
          setShateType(docType.Edit)
        }else if(selectValue.value == DocType[docType.Read]){
          setShateType(docType.Read)
        }else if(selectValue.value == DocType[docType.Share]){
          setShateType(docType.Share)
        }
      }
          ElMessage({
      message: `${t('share.copy_success')}`,
      type: 'success',
    })
    },() => {
        ElMessage({
          message: `${t('share.copy_failure')}`,
          type: 'success',
        })
    })
  }else {
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
    if(card.value) {
      let el = card.value
      el.style.top = Math.max(handleTop.value!, el.offsetHeight/2) + 'px'
    }
  })
})
watchEffect(() => {
getDocumentInfo()
getShareList()

  nextTick(() => {
    handleTop.value = props.pageHeight / 2
    if(card.value) {
      let el = card.value
      el.style.top = Math.max(handleTop.value!, el.offsetHeight/2) + 'px'
    }
  })
})

onMounted(() => {  
  if(!value1.value) {
    setShateType(docType.Private)
  }
  document.addEventListener('click', handleClick);
})

onUnmounted(() => {
  document.removeEventListener('click', handleClick);
})

</script>
<template>
  <div ref="card" class="card" :style="{top:  props.pageHeight / 2}">
    <el-card class="box-card" :style="{ width: 400 + 'px'}" v-if="!founder && docInfo">
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
          <p class="name">{{docInfo!.document.name}}</p>
        </div>
        <!-- 权限设置 -->
        <div class="purview">
          <span>{{ t('share.permission_setting') }}:</span>
          <el-select v-model="selectValue" style="width: 180px;" class="m-2">
            <el-option style="font-size: 10px;" class="option" v-for="item in options" :key="item.value" :label="item.label"
              :value="item.value" />
          </el-select>
          <el-button color="#0d99ff" size="small" @click="copyLink">{{ t('share.copy_link') }}</el-button>
        </div>
        <!-- 分享人 -->
        <div>
          <span>{{ t('share.people_who_have_joined_the_share') }} ({{ t('share.share_limit') }}5) :</span>
          <el-scrollbar height="285px" class="shared-by">
            <div class="scrollbar-demo-item">
              <div class="item-left">
                <div class="avatar"><img :src="userInfo?.userInfo.avatar"></div>
                <div class="name">{{ userInfo?.userInfo.nickname }}</div>
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
              <div class="item-right" @click="e => selectAuthority(ids, e)">
                <div class="authority">{{ permission[item.share_info.perm_type] }}</div>
                <div class="svgBox"><svg-icon class="svg" icon-class="bottom"></svg-icon></div>
                <div class="popover" v-if="authority && index === ids" ref="popover"
                  :style="{ top: posi.top + 'px', right: 30 + 'px' }">
                  <div @click="onEditable(item.id, permissions.editable, ids)">{{ editable }}</div>
                  <div @click="onReadOnly(item.id, permissions.readOnly, ids)">{{ readOnly }}</div>
                  <div @click="onRemove(item.id, ids)">{{ remove }}</div>
                </div>
              </div>
            </div>
          </el-scrollbar>
        </div>
      </div>
    </el-card>

    <el-card class="box-card" :style="{ width: 300 + 'px'}"  v-if="founder && docInfo">
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
          <p class="name">{{docInfo!.document.name}}</p>
        </div>
        <!-- 创建者 -->
        <div class="unfounder">
          <span>{{ t('share.founder') }}:</span>
          <p class="name">{{docInfo!.user.nickname}}</p>
        </div>
        <!-- 文档权限 -->
        <div class="unfounder">
          <span>{{ t('share.document_permission') }}:</span>
          <p class="name">{{DocType[1]}}</p>
        </div>
        <!-- 链接按钮 -->
        <div class="button bottom">
          <el-button color="#0d99ff" size="small" @click="copyLink">{{ t('share.copy_link') }}</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>
  
<style scoped lang="scss">
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
      height: 20px;
      width: 20px;
      border-radius: 50%;
      margin-right: 10px;

      >img {
        height: 100%;
        width: 100%;
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
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
}
.box-card {
  width: 400px;
}

</style>