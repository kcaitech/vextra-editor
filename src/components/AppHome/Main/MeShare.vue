
<template>
    <div class="title">
        <div class="indicator" :style="{ width: elwidth + 'px', left: elleft + 'px' }"></div>
        <div class="left">
            <div ref="myfile" @click="highlight(true, $event, '/apphome/meshare')"
                :style="{ color: active ? '#333333' : '#777777' }">
                {{ t('home.file_shared') }}</div>
            <div ref="mydel" @click="highlight(false, $event, '/apphome/recyclebin')"
                :style="{ color: active ? '#777777' : '#333333' }">
                {{ t('home.recycling_station') }}</div>
        </div>
    </div>
    <div v-if="active">
        <div class="tatle" style="height: calc(100vh - 144px);">
            <tablelist :data="searchlists" :iconlist="iconlists" @share="Sharefile" @deletefile="Deletefile"
                @dbclickopen="openDocument" @updatestar="Starfile" @rightMeun="rightmenu" :noNetwork="noNetwork"
                @refreshDoc="refreshDoc" />
        </div>
        <listrightmenu :items="items" :data="mydata" @get-doucment="getDoucment" @r-starfile="Starfile"
            @r-sharefile="Sharefile" @r-removefile="Deletefile" @ropen="openDocument" @moveFillAddress="moveFillAddress" />
        <FileShare v-if="showFileShare" @close="closeShare" :docId="docId" :selectValue="selectValue" :userInfo="userInfo"
            :docUserId="docUserId" @select-type="onSelectType" @switch-state="onSwitch" :shareSwitch="shareSwitch"
            :pageHeight="pageHeight">
        </FileShare>
        <MoveProjectFill :title="t('Createteam.movetip')" :confirm-btn="t('Createteam.move')" :projectItem="projectItem"
            :doc="mydata" :projectVisible="moveVisible" @clodeDialog="clodeDialog" @moveFillSeccess="moveFillSeccess">
        </MoveProjectFill>
    </div>
    <RecycleBin v-if="!active" />
    <div v-if="showFileShare" class="overlay"></div>
</template>

<script setup lang="ts">
import * as share_api from "@/request/share"
import * as user_api from '@/request/users'
import { ElMessage } from 'element-plus'
import { onMounted, ref, onUnmounted, nextTick, watch, inject, Ref, watchEffect } from "vue"
import { useI18n } from 'vue-i18n'
import { router } from '@/router'
import FileShare from '@/components/Document/Toolbar/Share/FileShare.vue'
import tablelist from '@/components/AppHome/tablelist.vue'
import { UserInfo } from '@/context/user';
import listrightmenu from "../listrightmenu.vue";
import MoveProjectFill from "@/components/TeamProject/MoveProjectFill.vue";
import RecycleBin from './RecycleBin.vue'
import Bus from '@/components/AppHome/bus'
import { useRoute } from 'vue-router'

interface data {
    document: {
        id: string
        name: string
        doc_type: number
        user_id: string
        project_id: string
    }
    document_favorites: {
        is_favorite: boolean
    }
}

const items = ['open', 'newtabopen', 'share', 'target_star', 'movefill', 'rename', 'copyfile', 'deletefile']
const { t } = useI18n()
const route = useRoute()
const showFileShare = ref<boolean>(false)
const shareSwitch = ref(true)
const pageHeight = ref(0)
const docId = ref('')
const mydata = ref()
const selectValue = ref(1)
const docUserId = ref('')
const noNetwork = ref(false)
const lists = ref<any[]>([])
const userInfo = ref<UserInfo | undefined>()
const iconlists = ref(['star', 'share', 'delete'])
const projectItem = ref<any>({});
const moveVisible = ref(false);
const { projectList } = inject('shareData') as {
    projectList: Ref<any[]>;
};

const myfile = ref<HTMLElement>()
const mydel = ref<HTMLElement>()
const elwidth = ref()
const elleft = ref()
const active = ref(true);

const highlight = (state: boolean, e?: MouseEvent, path?: string,) => {
    active.value = state;
    if (path) router.push({ path: path })
    if (e) {
        const rect = (e.target as HTMLElement).getBoundingClientRect()
        elwidth.value = rect.width
        elleft.value = rect.x
    }
}


//获取服务器我的文件列表
async function getDoucment() {
    try {
        const { data } = await share_api.getDoucmentListAPI() as any
        if (data == null) {
            noNetwork.value = true
            ElMessage.closeAll('error')
            ElMessage.error({ duration: 1500, message: t('home.failed_list_tips') })
        } else {
            noNetwork.value = false
            for (let i = 0; i < data.length; i++) {
                let { document: { size }, document_access_record: { last_access_time } } = data[i]
                data[i].document.size = sizeTostr(size)
                data[i].document_access_record.last_access_time = last_access_time.slice(0, 19)
            }
        }
        lists.value = Object.values(data)
    } catch (error: any) {
        if (error.data.code === 401) {
            return
        } else {
            noNetwork.value = true
            ElMessage.closeAll('error')
            ElMessage.error({ duration: 1500, message: t('home.failed_list_tips') })
        }
    }
}


const searchvalue = ref('');
const searchlists = ref<any[]>([])
Bus.on('searchvalue', (str: string) => {
    searchvalue.value = str
})

watchEffect(() => {
    searchlists.value = lists.value.filter((el: any) => el.document.name.toLowerCase().includes(searchvalue.value.toLowerCase()))
})


const refreshDoc = () => {
    getDoucment()
}
const moveFillAddress = (data: any) => {
    moveVisible.value = true;
}
const clodeDialog = () => {
    moveVisible.value = false;
}
const moveFillSeccess = () => {
    clodeDialog();
    const tiemr = setTimeout(() => {
        refreshDoc();
        clearTimeout(tiemr);
    }, 300)
}

//转换文件大小格式
function sizeTostr(size: any) {
    if ((size / 1024 / 1024 / 1024) > 1) {
        size = (size / 1024 / 1024 / 1024).toFixed(2) + "GB"
    } else if ((size / 1024 / 1024) > 1) {
        size = (size / 1024 / 1024).toFixed(2) + "MB"
    } else if ((size / 1024) > 1) {
        size = (size / 1024).toFixed(2) + "KB"
    } else {
        size = Math.round(size * 100) / 100 + "B"
    }
    return size
}

//右键打开或双击列表打开
const openDocument = (id: string) => {
    router.push({
        name: 'document',
        query: {
            id: id
        }
    })
}

//标星入口
const Starfile = async (data: data) => {
    const { document: { id } } = data
    data.document_favorites.is_favorite = data.document_favorites.is_favorite === true ? false : true
    if (data.document_favorites.is_favorite == true) {
        const { code } = await user_api.SetfavoriteStatus({ doc_id: id, status: true })
        if (code === 0) {
            ElMessage.closeAll('success')
            ElMessage.success({ duration: 1500, message: t('home.star_ok') })
        }
    } else {
        const { code } = await user_api.SetfavoriteStatus({ doc_id: id, status: false })
        if (code === 0) {
            ElMessage.closeAll('success')
            ElMessage.success({ duration: 1500, message: t('home.star_cancel') })
        }
    }
}

//分享入口
const Sharefile = (data: data) => {
    if (showFileShare.value) {
        showFileShare.value = false
        return
    }
    docUserId.value = data.document.user_id
    docId.value = data.document.id
    selectValue.value = data.document.doc_type !== 0 ? data.document.doc_type : data.document.doc_type
    userInfo.value = userData.value
    showFileShare.value = true
}


//删除文件入口
const Deletefile = async (data: data) => {
    const { document: { id } } = data
    const { code } = await user_api.MoveFile({ doc_id: id })
    if (code === 0) {
        lists.value = lists.value.filter((item: any) => item.document.id != data.document.id)
        ElMessage.closeAll('success')
        ElMessage.success({ duration: 1500, message: t('home.delete_ok_tips') })
    } else {
        ElMessage.closeAll('error')
        ElMessage.error({ duration: 1500, message: t('home.delete_no_tips') })
    }
}

//右键菜单入口
const rightmenu = (e: MouseEvent, data: data) => {
    const el = document.querySelector('.target_star')!
    const { document: { id }, document_favorites: { is_favorite } } = data
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight
    const rightmenu: any = document.querySelector('.rightmenu')
    const top = e.pageY
    const left = e.pageX
    nextTick(() => {
        const width = rightmenu.clientWidth
        const height = rightmenu.clientHeight
        rightmenu.style.left = left + width > viewportWidth ? (viewportWidth - width) + "px" : left + 'px'
        rightmenu.style.top = top + height > viewportHeight ? (viewportHeight - height) + 'px' : top + 'px'
    })

    if ((e.target as HTMLElement).closest('.el-table-v2__row')) {
        rightmenu.style.display = 'block'
    }
    nextTick(() => {
        if (is_favorite == true) {
            el.innerHTML = t('homerightmenu.unstar')
        } else {
            el.innerHTML = t('homerightmenu.target_star')
        }
    })
    docId.value = id
    mydata.value = data
    projectItem.value = projectList.value.filter(item => item.project.id === data.document.project_id)[0];
}

const userData = ref({
    avatar: localStorage.getItem('avatar') || '',
    id: localStorage.getItem('userId') || '',
    nickname: localStorage.getItem('nickname') || ''
})

const closeShare = () => {
    showFileShare.value = false
}
const getPageHeight = () => {
    pageHeight.value = window.innerHeight
}
const onSwitch = (state: boolean) => {
    shareSwitch.value = state
}
const onSelectType = (type: number) => {
    selectValue.value = type
}

watch(() => route.name, () => {
    Bus.on('searchvalue', (str: string) => {
        searchvalue.value = str
    })

    if (route.name != undefined) {
        if (route.name === 'meshare' || route.name === 'recyclebin') {
            if (route.path === '/apphome/meshare') {
                getDoucment();
                nextTick(() => {
                    highlight(true)
                    elwidth.value = myfile.value?.getBoundingClientRect().width
                    elleft.value = myfile.value?.getBoundingClientRect().x
                })
            }
            if (route.path === '/apphome/recyclebin') {
                nextTick(() => {
                    highlight(false)
                    elwidth.value = mydel.value?.getBoundingClientRect().width
                    elleft.value = mydel.value?.getBoundingClientRect().x
                })
            }
        }
    }
})



onMounted(() => {
    getDoucment();
    getPageHeight()
    window.addEventListener('resize', getPageHeight)
    if (route.name === "recyclebin") {
        highlight(false)
    }
    if (route.path === '/apphome/meshare') {
        nextTick(() => {
            elwidth.value = myfile.value?.getBoundingClientRect().width;
            elleft.value = myfile.value?.getBoundingClientRect().x;
        })
    }
    if (route.path === '/apphome/recyclebin') {
        nextTick(() => {
            elwidth.value = mydel.value?.getBoundingClientRect().width
            elleft.value = mydel.value?.getBoundingClientRect().x
        })
    }
})

onUnmounted(() => {
    window.removeEventListener('resize', getPageHeight)
})

</script>
<style lang="scss" scoped>
.overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    background-color: var(--overlay-bg-color);
}

.title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0 8px 24px 8px;
    box-sizing: border-box;

    .indicator {
        margin-top: 32px;
        position: absolute;
        height: 2px;
        background-color: rgba(24, 120, 245, 1);
        border-radius: 2px;
        transition: all 0.2s ease-in-out;
    }

    .left {
        display: flex;
        align-items: center;
        gap: 24px;
        font-size: 18px;
        font-weight: 500;
        letter-spacing: 2px;
        line-height: 36px;
        white-space: nowrap;
    }
}
</style>
