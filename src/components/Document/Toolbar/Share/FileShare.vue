<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive, watch, watchEffect, computed, nextTick, } from 'vue';
import { useI18n } from 'vue-i18n';
import { UserInfo } from '@/context/user';
import { Context } from '@/context';
import * as share_api from '@/request/share';
import { ElMessage } from 'element-plus';
import { useRoute } from 'vue-router';
import { DocInfo } from "@/context/user"
const { t } = useI18n()
const props = defineProps<{
  shareSwitch: boolean,
  docId?: string,
  docName?: string,
  selectValue: number,
  docUserId?: string,
  context?: Context,
  userInfo: UserInfo | undefined,
  docInfo?: DocInfo,
  project?: boolean,
  projectPerm?: number | undefined
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

const docInfo = ref<DocInfo>(props.docInfo!)
const route = useRoute()
const docID = props.docId ? props.docId : route.query.id
//const url = route.path !== '/document' ? `https://protodesign.cn/#/document?id=${docID}` + " " + `邀请您进入《${props.docName}》，点击链接开始协作` : location.href + ' ' + `邀请您进入《${docInfo.value.document.name}》，点击链接开始协作`

const value1 = ref(props.shareSwitch)
const authority = ref(false)
const index = ref(0)
const card = ref<HTMLDivElement>()
const editable = ref(`${t('share.editable')}`)
const reviewable = ref(`${t('share.reviewable')}`)
const readOnly = ref(`${t('share.readOnly')}`)
const remove = ref(`${t('share.remove')}`)
const founder = ref(false)
const userInfo = ref<UserInfo | undefined>(props.userInfo)
const shareList = ref<any[]>([])

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
    value: 1,
    label: `${t('share.need_to_apply_for_confirmation')}`
  },
  {
    value: 2,
    label: `${t('share.anyone_can_read_it')}`
  },
  {
    value: 3,
    label: `${t('share.anyone_can_comment')}`
  },
  {
    value: 4,
    label: `${t('share.anyone_can_edit_it')}`
  }
]

const DocType = reactive([`${t('share.shareable')}`, `${t('share.need_to_apply_for_confirmation')}`, `${t('share.anyone_can_read_it')}`, `${t('share.anyone_can_comment')}`, `${t('share.anyone_can_edit_it')}`])
const permission = reactive([`${t('share.no_authority')}`, `${t('share.readOnly')}`, `${t('share.reviewable')}`, `${t('share.editable')}`])
const selectValue = ref(DocType[props.selectValue === 0 ? 1 : props.selectValue])

const documentShareURL = computed(() => {
  return route.path !== '/document'
    ?
    location.origin + `/#/document?id=${docID}` + ' ' + `邀请您进入《${props.docName}》，点击链接开始协作`
    :
    location.href + ' ' + `邀请您进入《${docInfo.value.document.name}》，点击链接开始协作`
})


//获取文档信息
const getDocumentInfo = async () => {
  try {
    const { code, data, message } = await share_api.getDocumentInfoAPI({ doc_id: docID })
    if (code === 0) {
      docInfo.value = data
    } else {
      emit('close')
      ElMessage.error(message === '审核不通过' ? t('system.sensitive_reminder2') : message)
    }
  } catch (err) {
    console.log(err);
  }
}

//是否显示权限编辑菜单
const selectAuthority = (i: number, e: Event) => {
  e.stopPropagation()
  if (authority.value) {
    authority.value = false
    return
  }
  index.value = i
  authority.value = true
}

//设置为可编辑权限
const onEditable = (id: any, type: number, index: number) => {
  putShareAuthority(id, type)
  shareList.value[index].document_permission.perm_type = type
}

//设置为可评论权限
const onReviewable = (id: any, type: number, index: number) => {
  putShareAuthority(id, type)
  shareList.value[index].document_permission.perm_type = type
}

//设置为只读权限
const onReadOnly = (id: string, type: number, index: number) => {
  putShareAuthority(id, type)
  shareList.value[index].document_permission.perm_type = type
}

//移除分享列表（本地列表）
const onRemove = (id: string, i: number) => {
  delShare(id)
  shareList.value.splice(i, 1)
}

//获取当前文件分享列表
const getShareList = async () => {
  try {
    const { data } = await share_api.getShareListAPI({ doc_id: docID })
    if (data) {
      shareList.value = data
    }
  } catch (err) {
    console.log(err);
  }
}

//移除分享列表（服务端）
const delShare = async (id: string) => {
  try {
    await share_api.delShareAuthorityAPI({ share_id: id })
    getShareList()
  } catch (err) {
    console.log(err);
  }
}

//设置分享权限
const putShareAuthority = async (id: string, type: number) => {
  try {
    await share_api.putShareAuthorityAPI({ share_id: id, perm_type: type })
    getShareList()
  } catch (err) {
    console.log(err);
  }
}

//设置分享类型
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

//监听分享权限设置变化，并发送到服务端
watch(selectValue, (nVal, oVal) => {
  const index = DocType.findIndex(item => item === nVal)
  if (index === docType.Critical) {
    setShateType(docType.Critical)
  } else if (index === docType.Edit) {
    setShateType(docType.Edit)
  } else if (index === docType.Read) {
    setShateType(docType.Read)
  } else if (index === docType.Share) {
    setShateType(docType.Share)
  } else {
    setShateType(docType.Private)
    emit('switchState', true)
  }
  emit('selectType', index)
})

//监听分享开关变化,
watch(value1, (nVal, oVal) => {

  //获取当前选择权限类型的下标
  const index = DocType.findIndex(item => item === selectValue.value)
  if (nVal) {
    if (index === docType.Critical) {
      setShateType(docType.Critical)
    } else if (index === docType.Edit) {
      setShateType(docType.Edit)
    } else if (index === docType.Read) {
      setShateType(docType.Read)
    } else if (index === docType.Share) {
      setShateType(docType.Share)
    } else {
      setShateType(docType.Private)
      emit('switchState', true)
    }
    emit('selectType', index)
  } else {
    setShateType(docType.Private)
    emit('switchState', nVal)
    emit('selectType', docType.Private)
  }
})

watchEffect(() => {
  props.projectPerm;
  if (route.query.id) {
    const userId = props.userInfo?.id
    if (props.projectPerm) {
      if (props.projectPerm > 3) {
        return founder.value = false;
      } else if (props.projectPerm === 3) {
        if (props.docInfo && props.docInfo.user.id === userId) {
          return founder.value = false;
        } else {
          return founder.value = true;
        }
      } else {
        return founder.value = true;
      }
    } else {
      if (props.docUserId) {
        props.docUserId != userId ? founder.value = true : founder.value = false
      } else if (props.docInfo) {
        props.docInfo.user.id != userId ? founder.value = true : founder.value = false
      }
    }
  } else {
    const userId = props.userInfo?.id
    if (props.projectPerm) {
      if (props.projectPerm > 3) {
        return founder.value = false;
      } else if (props.projectPerm === 3) {
        if (props.docUserId && props.docUserId === userId) {
          return founder.value = false;
        } else {
          return founder.value = true;
        }
      } else {
        return founder.value = true;
      }
    } else {
      if (props.docUserId) {
        props.docUserId != userId ? founder.value = true : founder.value = false
      } else if (props.docInfo) {
        props.docInfo.user.id != userId ? founder.value = true : founder.value = false
      }
    }
  }
})


//复制分享链接
const copyLink = async () => {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(documentShareURL.value).then(() => {
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
    textArea.value = documentShareURL.value
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

watchEffect(() => {
  getDocumentInfo()
  if (!founder.value) getShareList()
})

const handlekeyup = (e: KeyboardEvent) => {
  e.stopPropagation()
  if (e.key === 'Escape' || e.keyCode === 27) {
    emit('close')
  }
}

const handleClick = (e: MouseEvent) => {
  e.stopPropagation()
  e.target instanceof Element && !e.target.closest('.box-card') && emit('close')
  e.target instanceof Element && !e.target.closest('.popover') && (authority.value = false)
  e.target instanceof Element && !e.target.closest('.options') && (isSelectOpen.value = false)

}

onMounted(() => {
  let timer: any
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    document.addEventListener('click', handleClick);
    clearTimeout(timer)
  }, 200);

  document.addEventListener('keyup', handlekeyup);

  if (!founder.value) {
    if (props.selectValue === docType.Private) {
      value1.value = false
      emit('switchState', false)
    } else {
      value1.value = true
    }
  }
})

onUnmounted(() => {
  document.removeEventListener('keyup', handlekeyup);
  document.removeEventListener('click', handleClick);
})

const isSelectOpen = ref<boolean>(false)
const inputselect = ref<HTMLInputElement>()
const openSelect = () => {
  isSelectOpen.value = !isSelectOpen.value;
}
const selectOption = (option: any) => {
  selectValue.value = DocType[option]
  isSelectOpen.value = false
  authority.value = false
}

</script>
<template>
  <el-card class="box-card" v-if="!founder && docInfo">
    <!-- 标题 -->
    <template #header>
      <div class="card-header">
        <div class="title">{{ t('share.file_sharing') }}</div>
        <div class="close" @click.stop="emit('close')">
          <svg-icon icon-class="close"></svg-icon>
        </div>
      </div>
    </template>
    <!-- 内容 -->
    <div class="contain">
      <!-- 开关 -->
      <div class="share-switch">
        <span class="type">{{ t('share.share_switch') }}：</span>
        <input id="switch" type="checkbox" v-model="value1">
        <label class="my_switch" for="switch"></label>

      </div>
      <!-- 文件名 -->
      <div class="file-name">
        <span class="type">{{ t('share.file_name') }}：</span>
        <p class="name">{{ docInfo!.document.name }}</p>
      </div>
      <!-- 权限设置 -->
      <div class="purview">
        <span class="type">{{ t('share.permission_setting') }}：</span>
        <div class="right">
          <input ref="inputselect" type="text" v-model="selectValue" @click.stop="openSelect"
            placeholder="Select an option" :disabled="props.selectValue === 0 ? true : false" readonly />
          <div class="shrink" @click.stop="inputselect?.click()">
            <svg-icon icon-class="down"
              :style="{ transform: isSelectOpen ? 'rotate(-180deg)' : 'rotate(0deg)', color: '#666666' }"></svg-icon>
          </div>
          <transition name="el-zoom-in-top">
            <ul v-show="isSelectOpen" class="options">
              <li class="options_item" v-for="option in options" :key="option.value"
                @click.stop="selectOption(option.value)">
                <span :style="{ fontWeight: option.label == selectValue ? 500 : 400 }">{{ option.label }}</span>
                <div class="choose" :style="{ visibility: option.label === selectValue ? 'visible' : 'hidden' }"></div>
              </li>
            </ul>
          </transition>
          <button class="copybnt" type="button" @click.stop="copyLink"
            :disabled="props.selectValue === 0 ? true : false">{{
              t('share.copy_link') }}</button>
        </div>
      </div>
    </div>
    <!-- 分享人 -->
    <div class="share_user">
      <span class="type">{{ t('share.people_who_have_joined_the_share') }} ({{ t('share.share_limit') }}5)：</span>
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
            <div class="shrink">
              <svg-icon icon-class="down"
                :style="{ transform: authority ? 'rotate(-180deg)' : 'rotate(0deg)', color: '#666666' }"></svg-icon>
            </div>
            <div class="popover" v-if="authority && index === ids" ref="popover">
              <div @click="onEditable(item.document_permission.id, permissions.editable, ids)">
                {{ editable }}
                <div class="choose"
                  :style="{ visibility: editable === permission[item.document_permission.perm_type] ? 'visible' : 'hidden' }">
                </div>
              </div>
              <div @click="onReviewable(item.document_permission.id, permissions.reviewable, ids)">
                {{ reviewable }}
                <div class="choose"
                  :style="{ visibility: reviewable === permission[item.document_permission.perm_type] ? 'visible' : 'hidden' }">
                </div>
              </div>
              <div @click="onReadOnly(item.document_permission.id, permissions.readOnly, ids)">
                {{ readOnly }}
                <div class="choose"
                  :style="{ visibility: readOnly === permission[item.document_permission.perm_type] ? 'visible' : 'hidden' }">
                </div>
              </div>
              <div @click="onRemove(item.document_permission.id, ids)">
                {{ remove }}
                <div class="choose"
                  :style="{ visibility: remove === permission[item.document_permission.perm_type] ? 'visible' : 'hidden' }">
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-scrollbar>
      <div class="project" v-if="project || props.docInfo?.project">项目中所有成员均可访问</div>
    </div>
  </el-card>

  <el-card class="box-card" v-if="founder && docInfo">
    <!-- 标题 -->
    <template #header>
      <div class="card-header">
        <div class="title">{{ t('share.file_sharing') }}</div>
        <div class="close" @click.stop="emit('close')">
          <svg-icon icon-class="close"></svg-icon>
        </div>
        <!-- <CloseIcon :size="20" @close="emit('close')" /> -->
      </div>
    </template>
    <div class="contain">
      <!-- 文件名 -->
      <div class="unfounder">
        <div class="type">{{ t('share.file_name') }}:</div>
        <p class="name">{{ docInfo!.document.name }}</p>
      </div>
      <!-- 创建者 -->
      <div class="unfounder">
        <div class="type">{{ t('share.founder') }}:</div>
        <p class="name">{{ docInfo!.user.nickname }}</p>
      </div>
      <!-- 文档权限 -->
      <div class="unfounder">
        <div class="type">{{ t('share.document_permission') }}:</div>
        <p class="name">{{ DocType[docInfo.document.doc_type] }}</p>
      </div>
      <div class="project" v-if="project || props.docInfo?.project">{{ t('Createteam.shareprojecttips') }}</div>
      <!-- 链接按钮 -->
      <div class="button bottom">
        <button class="copybnt" type="button" @click="copyLink"
          :disabled="docInfo.document.doc_type !== 0 ? false : true">{{
            t('share.copy_link') }}</button>
      </div>
    </div>
  </el-card>
</template>
  
<style scoped lang="scss">
:deep(.is-horizontal) {
  display: none !important;
  visibility: hidden !important;
}

:deep(.el-card__header) {
  border: none;
  padding: 0;
}

:deep(.el-card__body) {
  border: none;
  padding: 0;
}

@media (max-height: 550px) {
  .box-card {
    height: 100%;
    overflow: auto !important;
    animation: none !important;
  }
}

@media (max-width: 400px) {
  .box-card {
    width: 100% !important;
    overflow: auto !important;
  }
}

@keyframes move {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.project {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 400;
  color: #8C8C8C;
}

.copybnt {
  margin: auto;
  width: 80px;
  height: 32px;
  font-size: 13px;
  font-weight: 500;
  color: #FFFFFF;
  outline: none;
  border: none;
  border-radius: 6px;
  background: #1878F5;
  box-sizing: border-box;

  &:hover {
    background-color: rgba(66, 154, 255, 1);
  }

  &:active {
    background-color: rgba(10, 89, 207, 1);
  }

  &:disabled {
    background-color: rgba(189, 226, 255, 1);
  }
}



.box-card {
  width: 400px;
  padding: 0 24px 8px 24px;
  margin: auto;
  transform: translateY(0);
  border: 1px solid #F0F0F0;
  border-radius: 16px;
  background-color: white;
  box-sizing: border-box;
  overflow: hidden;
  z-index: 1000;
  box-shadow: 0px 2px 16px 0px rgba(0, 0, 0, 0.08);
  animation: move 0.25s ease-in-out;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 64px;
    padding: 0;

    .title {
      font-size: 16px;
      font-weight: 600;
    }

    .close {
      width: 16px;
      height: 16px;
      padding: 4px;
      border-radius: 6px;
      display: flex;

      &:hover {
        background-color: rgb(243, 243, 245);
        cursor: pointer;
      }

      &:active {
        background-color: #EBEBEB;
      }

      svg {
        width: 100%;
        height: 100%;
      }
    }

  }

  .contain {
    display: flex;
    flex-direction: column;

    .share-switch {
      display: flex;
      align-items: center;
      height: 38px;
      gap: 6px;

      .type {
        min-width: 65px;
        font-size: 13px;
        font-weight: 400;
        color: #8C8C8C;
      }

      .my_switch {
        width: 36px;
        height: 20px;
        border-radius: 40px;
        background-color: rgba(140, 140, 140, 1);
        position: relative;
        transition: all .3s ease-out;

        &::before {
          position: absolute;
          content: "";
          width: 16px;
          height: 16px;
          background-color: #F0F0F0;
          border-radius: 8px;
          top: 2px;
          left: 2px;
          transition: all .3s ease-out;
        }
      }

      input[type='checkbox'] {
        display: none;
      }

      input[type='checkbox']:checked+label::before {
        left: 18px;
      }

      input[type='checkbox']:checked+label {
        background-color: rgba(24, 120, 245, 1);
      }

    }

    .file-name {
      display: flex;
      align-items: center;
      height: 38px;
      gap: 8px;

      .type {
        min-width: 65px;
        font-size: 13px;
        font-weight: 400;
        color: #8C8C8C;
      }

      .name {
        font-size: 13px;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .purview {
      display: flex;
      align-items: center;
      height: 40px;
      gap: 6px;

      .type {
        min-width: 65px;
        font-size: 13px;
        font-weight: 400;
        color: #8C8C8C;
      }

      .right {
        display: flex;
        align-items: center;
        gap: 8px;

        input {
          width: 122px;
          height: 32px;
          font-size: 12px;
          font-weight: 400;
          outline: none;
          border: none;
          border-radius: 6px;
          padding: 3px 3px 3px 12px;
          background: #F5F5F5;
          box-sizing: border-box;

          &:hover {
            background-color: rgba(235, 235, 235, 1);
          }

          &:focus {
            background-color: rgba(235, 235, 235, 1);
          }

          &:disabled {
            background-color: rgba(240, 240, 240, 1) !important;
          }
        }

        .shrink {
          position: absolute;
          display: flex;
          align-items: center;
          right: 190px;
          width: 12px;
          height: 12px;
          color: rgba(102, 102, 102, 1);

          svg {
            transition: 0.5s;
            width: 100%;
            height: 100%;
          }
        }

        .options {
          position: absolute;
          top: 180px;
          right: 183px;
          padding: 0;
          margin: 0;
          width: 122px;
          background-color: white;
          border-radius: 8px;
          border: 1px solid #EBEBEB;
          box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.08);
          z-index: 1;
          box-sizing: border-box;

          .options_item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 40px;
            padding: 0 0 0 12px;

            &:hover {
              background-color: rgba(245, 245, 245, 1);
            }

            span {
              font-size: 12px;
              font-weight: 400;
            }

            .choose {
              box-sizing: border-box;
              width: 10px;
              height: 6px;
              margin-right: 4px;
              margin-left: 2px;
              border-width: 0 0 0.1em 0.1em;
              border-style: solid;
              border-color: rgb(0, 0, 0, .75);
              transform: rotate(-45deg) translateY(-30%);
            }
          }
        }


      }

    }

    .unfounder {
      display: flex;
      align-items: center;
      height: 40px;
      gap: 6px;

      .type {
        min-width: 65px;
        font-size: 13px;
        font-weight: 400;
        color: #8C8C8C;
      }

      .name {
        font-size: 13px;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .bottom {
      display: flex;
      height: 48px;
    }
  }


  .share_user {
    display: flex;
    flex-direction: column;

    .type {
      display: flex;
      align-items: center;
      height: 34px;
      font-size: 13px;
      font-weight: 400;
      color: #8C8C8C;
    }

    .shared-by {
      padding: 8px 12px;
      border-radius: 6px;
      background: #FFFFFF;
      box-sizing: border-box;
      border: 1px solid #EBEBEB;
      margin-bottom: 6px;

      .scrollbar-demo-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 40px;
        gap: 8px;

        .item-left {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          overflow: hidden;
          white-space: nowrap;

          .avatar {
            height: 24px;
            width: 24px;
            min-width: 24px;
            border-radius: 50%;
            overflow: hidden;

            img {
              height: 100%;
              width: 100%;
            }
          }

          .name {
            overflow: hidden;
            text-overflow: ellipsis;
            font-size: 13px;
            font-weight: 500;
            color: rgba(0, 0, 0, 1);
          }
        }

        .item-right {
          position: relative;
          height: 40px;
          display: flex;
          align-items: center;
          gap: 2px;

          .founder,
          .authority {
            font-size: 12px;
            font-weight: 400;
          }

          .shrink {
            display: flex;
            align-items: center;
            width: 12px;
            height: 12px;
            color: rgba(102, 102, 102, 1);

            svg {
              transition: 0.5s;
              width: 100%;
              height: 100%;
            }
          }

          .popover {
            position: absolute;
            top: 40px;
            right: 0px;
            display: flex;
            flex-direction: column;
            width: 88px;
            background-color: #fff;
            border: 1px solid #EBEBEB;
            border-radius: 8px;
            box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.08);
            box-sizing: border-box;

            >div {
              display: flex;
              align-items: center;
              justify-content: space-around;
              height: 40px;
              font-size: 12px;
              font-weight: 500;

              .choose {
                box-sizing: border-box;
                width: 10px;
                height: 6px;
                margin-right: 4px;
                margin-left: 2px;
                border-width: 0 0 0.1em 0.1em;
                border-style: solid;
                border-color: rgb(0, 0, 0, .75);
                transform: rotate(-45deg) translateY(-30%);
              }

              &:hover {
                background-color: rgba(245, 245, 245, 1);
              }
            }
          }
        }
      }
    }
  }
}
</style>