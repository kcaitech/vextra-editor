
<template>
    <tablelist :data="lists" :iconlist="iconlists" @share="Sharefile" @remove="Removefile" @dbclickopen="openDocument"
        @updatestar="Starfile" @rightMeun="rightmenu" />
        
    <!-- 右键菜单 -->
    <div class="rightmenu" ref="menu">
        <ul>
            <li @click="openDocument(docId)">{{ t('homerightmenu.open') }}</li>
            <li @click="openNewWindowDocument">{{ t('homerightmenu.newtabopen') }}</li>
            <div></div>
            <li @click.stop="rSharefile">{{ t('homerightmenu.share') }}</li>
            <li @click="rStarfile" ref="isshow">{{ t('homerightmenu.target_star') }}</li>
            <div></div>
            <li @click="rrename" v-if=showrenname>{{ t('homerightmenu.rename') }}</li>
            <li @click="rcopyfile" v-if=showcopyfile>{{ t('homerightmenu.copyfile') }}</li>
            <li @click="rRemovefile">{{ t('homerightmenu.removed_record') }}</li>
        </ul>
    </div>
    <!-- 重命名弹框 -->
    <el-dialog v-model="dialogVisible" :title="t('home.rename')" width="500" align-center>
        <input class="newname" type="text" v-model="newname" ref="renameinput" @keyup.enter="rename1" />
        <template #footer>
            <span class="dialog-footer">
                <el-button type="primary" style="background-color: none;" @click="rename1"
                    :disabled="newname == '' ? true : false">
                    {{ t('home.rename_ok') }}
                </el-button>
                <el-button @click=" dialogVisible = false">{{ t('home.cancel') }}</el-button>
            </span>
        </template>
    </el-dialog>
    <FileShare v-if=" showFileShare " @close=" closeShare " :docId=" docId " @switch-state=" onSwitch " :userInfo="userInfo"
        :selectValue=" selectValue " @select-type=" onSelectType " :shareSwitch=" shareSwitch " :pageHeight=" pageHeight ">
    </FileShare>
    <div v-if="showFileShare" class="overlay"></div>
</template>

<script setup lang="ts">
import * as user_api from '@/apis/users'
import { ElMessage } from 'element-plus'
import { ref, onMounted, onUnmounted, nextTick, watch, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { router } from '@/router'
import FileShare from '@/components/Document/Toolbar/Share/FileShare.vue'
import tablelist from '@/components/AppHome/tablelist.vue'
import { UserInfo } from '@/context/user';

const isLoading = ref(false)
const showFileShare = ref<boolean>(false);
const shareSwitch = ref(true)
const pageHeight = ref(0)
const lists = ref<any[]>([])
const selectValue = ref(1)
const isshow = ref<HTMLElement>()
const menu = ref<HTMLElement>()
const dialogVisible = ref(false)
const newname = ref()
const renameinput = ref()
const showrenname = ref<boolean>(true)
const showcopyfile = ref<boolean>(true)
const userInfo = ref<UserInfo | undefined>()
const docId = ref('')
const mydata = ref()
const listId = ref(0)
const iconlists = ref(['star', 'share', 'remove'])

const emits = defineEmits(['data-update'])


interface data {
    document: {
        id: string
        name: string
        doc_type: number
        user_id: string
    }
    document_favorites: {
        is_favorite: boolean
    }
    document_access_record: {
        id: string
    }
}

//获取服务器我的文件列表
async function getUserdata() {
    // loading
    isLoading.value = true
    try {
        const { data } = await user_api.GetDocumentsList() as any
        if (data == null) {
            ElMessage.error(t('home.failed_list_tips'))
        } else {
            for (let i = 0; i < data.length; i++) {
                let { document: { size }, document_access_record: { last_access_time } } = data[i]
                data[i].document.size = sizeTostr(size)
                data[i].document_access_record.last_access_time = last_access_time.slice(0, 19)
            }
        }
        lists.value = Object.values(data)
    } catch (error) {
        ElMessage.closeAll('error')
        ElMessage.error({ duration: 1500, message: t('home.failed_list_tips') })
    }
    // unloading  
    isLoading.value = false;
}

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

const userData = ref({
    avatar: localStorage.getItem('avatar') || '',
    id: localStorage.getItem('userId') || '',
    nickname: localStorage.getItem('nickname') || ''
})

//分享入口
const Sharefile = (data: data) => {
    if (showFileShare.value) {
        showFileShare.value = false
        return
    }
    userInfo.value = userData.value
    docId.value = data.document.id
    selectValue.value = data.document.doc_type !== 0 ? data.document.doc_type : data.document.doc_type
    showFileShare.value = true
}

//移除历史记录入口
const Removefile = async (data: data) => {
    const { document_access_record: { id } } = data
    const { code } = (await user_api.DeleteList({ access_record_id: id }))
    if (code === 0) {
        lists.value = lists.value.filter((item: any) => item.document.id != data.document.id)
        ElMessage.closeAll('success')
        ElMessage.success({ duration: 1500, message: t('home.access_record_ok') })
    } else {
        ElMessage.closeAll('error')
        ElMessage.error({ duration: 1500, message: t('home.access_record_no') })
    }

}

//右键菜单入口
const rightmenu = (e: MouseEvent, data: data, index: number) => {
    const { document: { id, user_id }, document_favorites: { is_favorite } } = data
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
        if (isshow.value) {
            if (is_favorite == true) {
                isshow.value.innerHTML = t('homerightmenu.unstar')
            } else {
                isshow.value.innerHTML = t('homerightmenu.target_star')
            }
        }
        if (user_id != localStorage.getItem('userId')) {
            showrenname.value = false
            showcopyfile.value = false
        } else {
            showrenname.value = true
            showcopyfile.value = true
        }
    })
    docId.value = id
    mydata.value = data
    listId.value = index
}

//右键打开
const openDocument = (id: string) => {
    router.push({
        name: 'document',
        query: {
            id: id
        }
    })
}

//右键新窗口打开
const openNewWindowDocument = () => {
    const Name = 'document'
    const query = { id: docId.value }
    const url = router.resolve({ name: Name, query: query }).href
    window.open(url, '_blank')
    if (menu.value) {
        menu.value.style.display = 'none'
    }
}

//右键标星
const rStarfile = () => {
    Starfile(mydata.value)
    if (menu.value) {
        menu.value.style.display = 'none'
    }
}

//右键分享
const rSharefile = () => {
    if (menu.value) {
        menu.value.style.display = 'none'
    }
     Sharefile(mydata.value)
}

//右键重命名
//弹框
const rrename = () => {
    newname.value = mydata.value.document.name
    if (dialogVisible.value) {
        dialogVisible.value = false
    } else {
        dialogVisible.value = true
        setTimeout(() => {
            renameinput.value.focus()
            renameinput.value.select()
        }, 100)
    }
    if (menu.value) {
        menu.value.style.display = 'none'
    }
}

//重命名
const rename1 = async () => {
    const { document: { id, name } } = mydata.value
    newname.value = renameinput.value.value
    if (newname.value == '') return
    if (newname.value != name)
        try {
            const { code, message } = await user_api.Setfilename({ doc_id: id, name: newname.value })
            if (code === 0) {
                ElMessage.closeAll('success')
                ElMessage.success({ duration: 1500, message: t('percenter.successtips') })
                lists.value.find((item: any) => item.document.id === id).document.name = newname.value
            }
            if (code === -1) {
                ElMessage.closeAll('error')
                ElMessage.error({ duration: 1500, message: message })
            }
        } catch (error) {
            ElMessage.closeAll('error')
            ElMessage.error({ duration: 1500, message: t('home.other_tips') })
        }
    dialogVisible.value = false
}

//右键创建副本
const rcopyfile = async () => {
    const { code } = await user_api.Copyfile({ doc_id: docId.value })
    if (code === 0) {
        ElMessage.closeAll('success')
        ElMessage.success({ duration: 1500, message: t('homerightmenu.copyfile_ok') })
        getUserdata()
    } else {
        ElMessage.closeAll('error')
        ElMessage.error({ duration: 1500, message: t('homerightmenu.copyfile_no') })
    }
    if (menu.value) {
        menu.value.style.display = 'none'
    }
}

//右键移除历史记录
const rRemovefile = async () => {
    Removefile(mydata.value)
    if (menu.value) {
        menu.value.style.display = 'none'
    }
}


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

//监听页面点击事件，
const handleClickOutside = (event: MouseEvent) => {
    if (event.target instanceof Element && event.target.closest('.rightmenu') == null) {
        if (menu.value) {
            menu.value.style.display = 'none'
        }
    }
}

// watch(lists, (Nlist) => {
//         emits('data-update', Nlist)
//     }, { deep: true })

//===>Main组件接收
watchEffect(() => {
    emits('data-update', lists.value, t('home.modification_time'))
})

onMounted(() => {
    getUserdata()
    getPageHeight()
    window.addEventListener('resize', getPageHeight)
    document.addEventListener('mousedown', handleClickOutside)
})
onUnmounted(() => {
    window.removeEventListener('resize', getPageHeight)
    document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<style lang="scss" scoped>
main {
    height: auto;
}

.title {
    display: flex;
    justify-content: space-between;
    padding: 0 10px 6px 10px;
    color: #606266;
    font-size: 14px;
    font-weight: 600;
    overflow: hidden;

    span {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        margin-right: 10px;
    }

    span:nth-child(1) {
        flex: 2;
    }

    span:not(:nth-child(1)) {
        flex: 1;

    }

    div {
        flex: 1;
        padding: 0 10px 6px 0;
        display: flex;

    }
}

.newname {
    outline: none;
    height: 30px;
    width: 460px;
    box-sizing: border-box;

    &:hover {
        border-radius: 2px;
        border: 2px #f3f0ff solid;

    }

    &:focus {
        border-radius: 2px;
        border: 2px #9775fa solid;
    }

}

.dialog-footer>.el-button {
    &:hover {
        background-color: rgba(208, 208, 208, 0.167);
    }

    &:active {
        background-color: white;
    }
}

.dialog-footer>.el-button--primary {
    background-color: #9775fa;
    color: white;
    border-color: #9775fa;

    &:hover {
        background: #9675fa91;
        border-color: #9675fa91;
    }

    &:active {
        background-color: #9775fa;
    }

    &[disabled] {
        background: #e5dbff;
        border: 1px #e5dbff solid;
    }
}

.rightmenu {
    display: none;
    min-width: 200px;
    min-height: 100px;
    z-index: 999;
    position: absolute;
    background-color: white;
    padding: 10px 0;
    border-radius: 5px;
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);

    ul {
        margin: 0;
        padding: 0 10px;

        li {
            display: block;
            padding: 10px 10px;
            font-size: 14px;
            text-decoration: none;
            color: rgba(13, 13, 13, 0.9);
            border-radius: 2px;
            cursor: pointer;

            &:hover {
                background-color: #f3f0ff;
            }
        }

        div {
            height: 1px;
            width: auto;
            background: #f3f0ff;
        }


    }
}

.el-icon {
    display: none;
    position: relative;
    top: 5px;

    &:hover {
        color: #6395f9;
        background: rgba(185, 185, 185, 0.5);
        border-radius: 2px;
    }

    &:active {
        color: #145ff6;

    }

    &:focus-visible {
        outline: none;
    }
}

:deep(.el-icon) {
    &>:focus {
        outline: none;
    }

    &>:focus-visible {
        outline: none;
    }
}

.el-table__row:hover .el-icon {
    display: inline-block;
}

:deep(.el-table_2_column_7) {
    text-align: center;
}

:deep(.el-table__row) {
    height: 56px;
    font-weight: 18px;
}

:deep(.el-table__cell) {
    padding: 0;
}

:deep(.el-table__cell .cell) {
    line-height: 56px;
}

.overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    background-color: rgba(0, 0, 0, 0.5);
}
</style>
