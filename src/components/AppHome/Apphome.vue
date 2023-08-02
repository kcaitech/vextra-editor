<template>
  <div class="common-layout">
    <el-container>
      <el-header height="56" min-height="56">
        <Header :items="items" :title="searchtitle" />
      </el-header>
      <el-container>
        <el-aside width="260px" min-width="260px">
          <Aside @settitle="setTitle" />
        </el-aside>
        <el-main>
          <Main :title="title" @data-update="update" />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>


<script setup lang="ts">
import Aside from './Aside.vue';
import Header from './Header.vue';
import Main from './Main.vue';
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { NetworkStatus } from '@/communication/modules/network_status'
import { insertNetworkInfo } from "@/utils/message"
const { t } = useI18n();
const title = ref<any>(sessionStorage.getItem('title') ? sessionStorage.getItem('title') : t('home.recently_opened'));
const searchtitle = ref('')
let items = ref<any[]>([])
const link_success = t('message.link_success')
const network_anomaly = t('message.network_anomaly')

function setTitle(t: string) {
  title.value = t;
  sessionStorage.setItem('title', title.value)
}

//===>接收到最新的lists,props传给Headher组件
const update = (data: any, title: any) => {
  items.value = data
  searchtitle.value = title
}

//网络连接成功message信息
const networkLinkSuccess = () => {
    insertNetworkInfo('netError', false, network_anomaly)
    insertNetworkInfo('networkSuccess', true, link_success)
    const timer = setTimeout(() => {
        insertNetworkInfo('networkSuccess', false, link_success)
        clearTimeout(timer)
    }, 3000)
}
// 网络断开连接提示信息
const networkLinkError = () => {
    insertNetworkInfo('networkSuccess', false, link_success)
    insertNetworkInfo('netError', true, network_anomaly)
    const timer = setTimeout(() => {
        insertNetworkInfo('netError', false, network_anomaly)
        clearTimeout(timer)
    }, 3000)
}

const networkStatu = () => {
    const token = localStorage.getItem("token") || "";
    const networkStatus = NetworkStatus.Make(token);
    networkStatus.addOnChange((status: any) => {
        const s = (status.status)as any
        if(s === 1) {
          // 网络断开连接
          networkLinkError()
        }else {
          // 网络连接成功
          networkLinkSuccess()
        }
    })
}

const closeNetMsg = () => {
    insertNetworkInfo('netError', false, network_anomaly)
    insertNetworkInfo('networkSuccess', false, link_success)
}
onMounted(() => {
  networkStatu()
})

onUnmounted(() => {
  closeNetMsg()
  const token = localStorage.getItem("token") || "";
  const networkStatus = NetworkStatus.Make(token);
  // networkStatus.close()
})

</script>

<style lang="scss" scoped>
.el-header{
  margin-top: 8px;
}
.el-main{
  padding-top: 0;
}
.el-aside {
  border-right: rgba(239, 239, 239, 0.838) solid 1px;
  transition: all .3s ease-in-out;
}

@media screen and (max-width:1000px) {
  .el-aside {
    width:60px;
  }

}
</style>