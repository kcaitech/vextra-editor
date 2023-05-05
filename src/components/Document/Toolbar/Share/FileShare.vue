<script setup lang="ts">
import { defineEmits, ref,onMounted,onUnmounted,nextTick, reactive, watch, watchEffect, defineProps } from 'vue'
import { useI18n } from 'vue-i18n'
import { User } from '@/context/user'
import * as share_api from '@/apis/share'
import { ElMessage } from 'element-plus'
const { t } = useI18n()
const props = defineProps<{
  docInfo: any
}>()
const emit = defineEmits<{
  (e: 'close'): void
}>()
enum permissions {
  noAuthority,
  readOnly,
  reviewable,
  editable
}
const url = `http://localhost:8080/#/apply?id=${props.docInfo.document.id}`
const docID = '1672502400000'
const value1 = ref(true)
const selectValue = ref('需申请确认')
const authority = ref(false)
const index = ref(0)
const editable = ref('可编辑')
const readOnly = ref('只读')
const remove = ref('移除')
const founder = ref(false)
const userInfo = ref<User>()
let shareList: any = ref([])
const posi = ref({
  top: 0,
  left: 0
})
enum docType  {
  Private,
  Share,
  Read,
  Critical,
  Edit
}
const popover = ref<HTMLDivElement>()
const options = [
  {
    value: '需申请确认',
    label: '需申请确认'
  },
  {
    value: '任何人均可阅读',
    label: '任何人均可阅读'
  },
  {
    value: '任何人均可编辑',
    label: '任何人均可编辑'
  },
  {
    value: '任何人可评论',
    label: '任何人可评论'
  }
]
const DocType = reactive(['需申请确认','可分享','任何人均可阅读','任何人可评论','任何人均可编辑'])
const permission = reactive(['无权限', '只读', '可评论','可编辑'])
const closeShare = (e: MouseEvent) => {
  e.stopPropagation()
  emit('close')
}
const handleClick = (e: MouseEvent) => {
  e.stopPropagation()
  e.target instanceof Element && !e.target.closest('.box-card') && emit('close');
  if(e.target instanceof Element && !e.target.closest('.popover')) {
    authority.value = false
  }
 
}
const selectAuthority = (i: number, e: Event) => {
  e.stopPropagation()
  if(authority.value) {
    authority.value = false
    return
  }
  index.value = i
  authority.value = true
  const el = (e.target as HTMLDivElement)
  nextTick(() => {
    posi.value.top = Math.max(el.parentElement!.offsetHeight,35) * (i + 2)
  })
}
const onEditable = (id: number, type: number, index: number) => {
  putShareAuthority(id, type)
  shareList.value[index].perm_type = type;
}
const onReadOnly = (id: number, type: number, index: number) => {
  putShareAuthority(id, type)
  shareList.value[index].perm_type = type;
}
const onRemove = (id: number, i: number) => {
  delShare(id)
  shareList.value.splice(i, 1)
}
const getShareList = async() => {
  const {data} = await share_api.getShareListAPI({doc_id: docID})
  shareList.value = data
}
const delShare = async (id: number) => {
  await share_api.delShareAuthorityAPI({share_id: id})
}
const putShareAuthority = async(id: number, type: number) => {
  await share_api.putShareAuthorityAPI({share_id:id, perm_type: type}) 
}
const setShateType = async (type: number) => {
  await share_api.setShateTypeAPI({doc_id: docID, doc_type: type})
}
watch(selectValue, (nVal, oVal) => {
  if (nVal == DocType[docType.Critical]) {
    setShateType(docType.Critical)
  } else if (nVal == DocType[docType.Edit]) {
    setShateType(docType.Edit)
  }else if (nVal == DocType[docType.Private]) {
    setShateType(docType.Private)
  }else if (nVal == DocType[docType.Read]) {
    setShateType(docType.Read)
  }else if (nVal == DocType[docType.Share]) {
    setShateType(docType.Share)
  }
})
watchEffect(() => {
  setShateType(docType.Private)
})
userInfo.value = ((window as any).skuser as User);
getShareList()
const copyLink = () => {
  navigator.clipboard.writeText(url).then(() => {
    ElMessage({
    message: '复制成功',
    type: 'success',
  })
  },() => {
      ElMessage({
        message: '复制失败',
        type: 'success',
      })
  })
}

onMounted(() => {
  document.addEventListener('click', handleClick);
})

onUnmounted(() => {
  document.removeEventListener('click', handleClick);
})

</script>
<template>
  <el-card class="box-card" ref="card" :style="{width: founder? 300+ 'px': 400+'px'}">
    <!-- 标题 -->
    <template #header>
      <div class="card-header">
        <span>文件分享</span>
        <el-button class="button" text @click="closeShare">
          <div class="close"> X </div>
        </el-button>
      </div>
    </template>
    <!-- 内容 -->
    <div class="contain" v-if="!founder">
      <!-- 开关 -->
      <div class="share-switch">
        <span>分享开关:</span>
        <el-switch class="switch" size="small" v-model="value1" />
      </div>
      <!-- 文件名 -->
      <div class="file-name">
        <span>文件名:</span>
        <p class="name">页面顺序调整</p>
      </div>
      <!-- 权限设置 -->
      <div class="purview">
        <span>权限设置:</span>
        <el-select v-model="selectValue" style="width: 180px;" class="m-2">
          <el-option style="font-size: 10px;" class="option"
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-button color="#0d99ff" size="small" @click="copyLink">复制链接</el-button>
      </div>
      <!-- 分享人 -->
      <div>
        <span>已加入分享的人 (分享限制人数5) :</span>
        <el-scrollbar height="250px" class="shared-by">
          <div class="scrollbar-demo-item">
            <div class="item-left">
              <div class="avatar"><img :src="userInfo?.userInfo.avatar"></div>
              <div class="name">{{userInfo?.userInfo.nickname}}</div>
            </div>
            <div class="item-right">
              <div class="founder">创建者</div>
            </div>
          </div>
          <div v-for="(item, ids) in shareList" :key="ids" class="scrollbar-demo-item">
            <div class="item-left">
              <div class="avatar"><img :src="item.user.avatar"></div>
              <div class="name">{{item.user.nickname}}</div>
            </div>
            <div class="item-right" @click="e => selectAuthority(ids, e)">
              <div class="authority">{{permission[item.perm_type] }}</div>
              <div class="svgBox"><svg-icon class="svg" icon-class="bottom"></svg-icon></div>
              <div class="popover" v-if="authority && index === ids" ref="popover" :style="{top: posi.top + 'px',right: 30 + 'px'}">
                <div @click="onEditable(item.id, permissions.editable,ids)">{{editable}}</div>
                <div @click="onReadOnly(item.id, permissions.readOnly,ids)">{{readOnly}}</div>
                <div @click="onRemove(item.id, ids)">{{remove}}</div>
              </div>
            </div>
          </div>
        </el-scrollbar>
      </div>
    </div>
    <div class="contain" v-else>
       <!-- 文件名 -->
       <div class="unfounder">
        <span>文件名:</span>
        <p class="name">页面顺序调整</p>
      </div>
       <!-- 创建者 -->
       <div class="unfounder">
        <span>创建者:</span>
        <p class="name">张三</p>
      </div>
       <!-- 文档权限 -->
       <div class="unfounder">
        <span>文档权限:</span>
        <p class="name">任何人均可阅读</p>
      </div>
      <!-- 链接按钮 -->
      <div class="button bottom">
        <el-button color="#0d99ff" size="small">复制链接</el-button>
      </div>
    </div>
  </el-card>
  
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

::v-deep .el-card__header {
  border-bottom: none;
  padding: var(--default-padding);
  padding-bottom: 0;
}
::v-deep .el-card__body {
  padding: var(--default-padding-half) var(--default-padding)
}
::v-deep .el-input {
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
    .avatar{
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
  .item-right{
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
.box-card {
  width: 400px;
  position: absolute;
  top: 40px;
  right: 0;
}</style>