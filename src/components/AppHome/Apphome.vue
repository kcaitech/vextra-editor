<template>
  <div class="common-layout">
    <el-container>
      <el-aside width="240px">
        <Aside />
      </el-aside>
      <el-container>
        <el-header>
          <Header :items="items" :title="searchtitle" />
        </el-header>
        <el-main>
          <Main />
        </el-main>
      </el-container>
    </el-container>
    <HelpEntrance />
  </div>
</template>


<script setup lang="ts">
import Aside from './Aside.vue';
import Header from './Header.vue';
import Main from './Main.vue';
import { ref, onUnmounted, provide, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { NetworkStatus } from '@/communication/modules/network_status'
import { insertNetworkInfo } from "@/utils/message"
import * as user_api from '@/request/users';
import HelpEntrance from '../Help/HelpEntrance.vue';
import isMobileDevice from '@/utils/mobileDeviceChecker';
import { router } from '@/router';

const { t } = useI18n();
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
const projectList = ref<any[]>([]);
const favoriteList = ref<any[]>([]);
const is_favor = ref<boolean>();
const is_team_upodate = ref<boolean>(false);
const activeNames = ref<any[]>([-1])
const targetItem = ref<any[]>([])
const menuState = ref(false);

const updateShareData = (id: string, name: string, avatar: string, description: string, selfpermtype: number) => {
  teamID.value = id
  teamName.value = name
  teamAvatar.value = avatar
  teamDescription.value = description
  teamSelfPermType.value = selfpermtype
}

const setMenuVisi = (state: boolean) => {
  menuState.value = state;
}

//添加targetitem的值
const addTargetItem = (data: any[]) => {
  targetItem.value = data
}

//用户改变activeNames的值
const updateActiveNames = {
  add: (n: number) => activeNames.value.push(n),
  del: (n: number) => activeNames.value = activeNames.value.filter(item => item != n)
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

const updateProject = () => {
  GetprojectLists();
}

//用于改变updateprojectlist的值
const updateprojectliststate = (b: boolean) => {
  updateprojectlist.value = b
}
const GetprojectLists = async () => {
  try {
    const { data } = await user_api.GetprojectLists()
    const project = favoriteProjectList(data, favoriteList.value)
    saveProjectData(project)
  } catch (error) {
    console.log(error);
  }
}

const favoriteProjectList = (arr1: any[], arr2: any[]) => {
  const projectList = arr1.map(item => {
    item.is_favor = arr2.some(value => value.project.id === item.project.id)
    return item;
  })
  return projectList;
}

provide('shareData', {
  teamID,
  teamName,
  teamAvatar,
  teamDescription,
  teamSelfPermType,
  updateShareData,
  //
  updatestate,
  state,
  //
  teamData,
  upDateTeamData,
  //
  updateprojectlist,
  updateprojectliststate,
  //
  projectList,
  saveProjectData,
  //
  favoriteList,
  favoriteListsData,
  //
  is_favor,
  updateFavor,
  //
  is_team_upodate,
  teamUpdate,
  //
  activeNames,
  updateActiveNames,
  //
  targetItem,
  addTargetItem,
  updateProject,
  setMenuVisi,
  menuState
})

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

let timer: any
onMounted(() => {
  // if(isMobileDevice()){
  //   router.push({name:'mobilehome'})
  // }
  GetprojectLists();
  if (timer) {
    clearInterval(timer)
  }
  timer = setInterval(() => {
    GetprojectLists();
  }, 60000);
})

onUnmounted(() => {
  closeNetMsg()
  if (timer) {
    clearInterval(timer)
  }
  networkStatus.close()
})

</script>

<style lang="scss" scoped>
.common-layout {
  height: 100%;
  overflow: hidden;
}

.el-header {
  padding: 0 20px 0 0;
}

.el-main {
  padding: 0;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 1);
  border: 1px solid rgba(241, 242, 242, 1);
  border-radius: 10px 10px 0 0;

}

.el-aside {
  height: 100%;
  transition: all .3s ease-in-out;
}

@media screen and (max-width:1000px) {
  .el-aside {
    width: 60px;
  }

}
</style>