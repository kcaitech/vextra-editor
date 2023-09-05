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
import { ref, onUnmounted, provide } from 'vue';
import { useI18n } from 'vue-i18n';
import { NetworkStatus } from '@/communication/modules/network_status'
import { insertNetworkInfo } from "@/utils/message"
const { t } = useI18n();
const title = ref<any>(sessionStorage.getItem('title') ? sessionStorage.getItem('title') : t('home.recently_opened'));
const searchtitle = ref('')
let items = ref<any[]>([])
const link_success = t('message.link_success')
const network_anomaly = t('message.network_anomaly')
const teamID = ref('')
const teamName = ref('')
const teamAvatar = ref('')
const teamDescription = ref('')
const teamSelfPermType = ref<number>()
const teamData = ref<any[]>([]) //储存团队列表
const updatestate = ref(false) //控制aside组件中的团队列表请求
const updateprojectlist = ref(false)  //控制projectlist组件中的项目列表请求
const projectList =  ref<any[]>([]);
const favoriteList =  ref<any[]>([]);
const is_favor = ref<boolean>();
const is_team_upodate = ref<boolean>(false);

const updateShareData = (id: string, name: string, avatar: string, description: string, selfpermtype: number) => {
  teamID.value = id
  teamName.value = name
  teamAvatar.value = avatar
  teamDescription.value = description
  teamSelfPermType.value = selfpermtype
}

//用于改变updatestate的值
const state = (b: boolean) => {
  updatestate.value = b 
}

const updateFavor = (s: boolean) => {
  is_favor.value = s
}
const teamUpdate = (b: boolean) => {
  is_team_upodate.value = b
}

//将获取的团队列表保存在到teamData
const upDateTeamData = (data: any[]) => {
  teamData.value = data
}

const saveProjectData = (data: any[]) => {
  projectList.value = data
}

const favoriteListsData = (data: any[]) => {
  favoriteList.value = data
}

//用于改变updateprojectlist的值
const updateprojectliststate = (b: boolean) => {
  updateprojectlist.value = b
}

provide('shareData', {
  teamID,
  teamName,
  teamAvatar,
  teamDescription,
  teamSelfPermType,
  updatestate,
  updateShareData,
  state,
  updateprojectlist,
  upDateTeamData,
  updateprojectliststate,
  saveProjectData,
  favoriteListsData,
  projectList,
  teamData,
  favoriteList,
  updateFavor,
  is_favor,
  is_team_upodate,
  teamUpdate
})

function setTitle(t: string) {
  title.value = t;
  sessionStorage.setItem('title', title.value)
}

//===>接收到最新的lists,props传给Headher组件
const update = (data: any, title: any) => {
  //main组件传过来的lists和title
  items.value = data || []
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
const token = localStorage.getItem("token") || "";
const networkStatus = NetworkStatus.Make(token);
networkStatus.addOnChange((status: any) => {
  const s = (status.status) as any
  if (s === 1) {
    // 网络断开连接
    networkLinkError()
  } else {
    // 网络连接成功
    networkLinkSuccess()
  }
})

const closeNetMsg = () => {
  insertNetworkInfo('netError', false, network_anomaly)
  insertNetworkInfo('networkSuccess', false, link_success)
}

onUnmounted(() => {
  closeNetMsg()
  networkStatus.close()
})

</script>

<style lang="scss" scoped>
.common-layout {
  height: 100vh;
  overflow: hidden;
}

.el-header {
  margin-top: 8px;
}

.el-main {
  padding-top: 0;
}

.el-aside {
  border-right: rgba(239, 239, 239, 0.838) solid 1px;
  transition: all .3s ease-in-out;
}

@media screen and (max-width:1000px) {
  .el-aside {
    width: 60px;
  }

}
</style>