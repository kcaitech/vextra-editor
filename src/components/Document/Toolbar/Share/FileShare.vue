<script setup lang="ts">
import { defineEmits, ref,onMounted,onUnmounted,nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { User } from '@/context/user'
import * as share_api from '@/apis/share'
import { cloneDeep } from 'lodash'
const { t } = useI18n()
const emit = defineEmits<{
  (e: 'close'): void
}>()
enum permissions {
  noAuthority,
  readOnly,
  reviewable,
  editable
}
const docID = '7974d5b3-273f-4364-82e3-2aba93d6ac92'
const value1 = ref(true)
const selectValue = ref('需申请确认')
const authority = ref(false)
const index = ref(0)
const editable = ref('可编辑')
const readOnly = ref('只读')
const remove = ref('移除')
const founder = ref(false)
const userInfo = ref<User>()
let shareList: any = ref([{
  data: []
}])
const posi = ref({
  top: 0,
  left: 0
})
const popover = ref<HTMLDivElement>()
const options = [
  {
    value: '需申请确认',
    label: '需申请确认',
  },
  {
    value: '任何人均可阅读',
    label: '任何人均可阅读',
  },
  {
    value: '任何人均可编辑',
    label: '任何人均可编辑',
  }
]
const permission = ref(['无权限', '只读', '可评论','可编辑'])
const closeShare = (e: MouseEvent) => {
  e.stopPropagation()
  emit('close')
}
const refersh = ref(false)
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
const onEditable = (id: number, type: number) => {
  putShareAuthority(id, type)
  shareList.value.data.perm_type = type;
  refersh.value = !refersh.value
  setTimeout(() => {
    refersh.value = !refersh.value
  })


  
}
const onReadOnly = (id: number, type: number) => {
  putShareAuthority(id, type)
}
const onRemove = (i: number) => {
}
const getShareList = async() => {
  const {data} = await share_api.getShareListAPI({doc_id: docID})
  shareList.value.data = data
  console.log(shareList.value.data);
  
}
const putShareAuthority = async(id: number, type: number) => {
  await share_api.putShareAuthorityAPI({share_id:id, perm_type: type}) 
}

userInfo.value = ((window as any).skuser as User);
onMounted(() => {
  getShareList()
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
        <el-button color="#0d99ff" size="small">复制链接</el-button>
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
          <div v-for="(item, ids) in shareList.data" :key="ids" class="scrollbar-demo-item">
            <div class="item-left">
              <div class="avatar"><img :src="item.user.avatar"></div>
              <div class="name">{{item.user.nickname}}</div>
            </div>
            <div class="item-right" @click="e => selectAuthority(ids, e)">
              <div class="authority" v-if="!refersh">{{permission[item.perm_type] }}</div>
              <div class="svgBox"><svg-icon class="svg" icon-class="bottom"></svg-icon></div>
              <div class="popover" v-if="authority && index === ids" ref="popover" :style="{top: posi.top + 'px',right: 30 + 'px'}">
                <div @click="onEditable(item.id, permissions.editable)">{{editable}}</div>
                <div @click="onReadOnly(item.id, permissions.readOnly)">{{readOnly}}</div>
                <div @click="onRemove(ids)">{{remove}}</div>
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