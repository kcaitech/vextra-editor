
<template>
    <!-- 表格布局 -->
    <el-table :data="getDoucmentList" height=83vh style="width: 100%" v-loading="isLoading" empty-text="没有内容"
        @row-dblclick="toDocument" @row-contextmenu="rightmenu">
        <el-table-column prop="document.name" :label="t('home.file_name')" />
        <el-table-column prop="document_access_record.last_access_time" :label="t('home.modification_time')" />
        <el-table-column prop="document.size" :label="t('home.size')" />
        <el-table-column class="operation" :label="t('home.operation')" type="index" width="180"
            style="text-align: center;">
            <template #default=" scope: any ">
                <el-icon :size=" 20 " v-if=" !getDoucmentList[scope.$index].document_favorites.is_favorite ">
                    <el-tooltip :content=" t('home.star') " :show-after=" 1000 ">
                        <svg-icon class="svg star" style="width: 20px; height: 20px;" icon-class="star"
                            @click.stop=" Starfile(scope.$index) ">
                        </svg-icon>
                    </el-tooltip>
                </el-icon>&nbsp;
                <el-icon :size=" 20 " style="display: inline-block;" v-else>
                    <el-tooltip :content=" t('home.de_star') " :show-after=" 1000 ">
                        <svg-icon class="svg star" style="width: 20px; height: 20px;" icon-class="stared"
                            @click.stop=" Starfile(scope.$index) ">
                        </svg-icon>
                    </el-tooltip>
                </el-icon>&nbsp;
                <el-icon :size=" 20 ">
                    <el-tooltip :content=" t('home.share') " :show-after=" 1000 ">
                        <Share @click.stop=" Sharefile(scope) " />
                    </el-tooltip>
                </el-icon>&nbsp;
                <el-icon :size=" 20 ">
                    <el-tooltip :content=" t('home.delete') " :show-after=" 1000 ">
                        <Delete @click.stop=" Deletefile(scope.$index) " />
                    </el-tooltip>
                </el-icon>&nbsp;
            </template>
        </el-table-column>
    </el-table>
    <!-- 右键菜单 -->
    <div class="rightmenu" ref="menu">
        <ul>
            <li @click=" openDocument ">{{t('homerightmenu.open')}}</li>
            <li @click=" openNewWindowDocument ">{{t('homerightmenu.newtabopen')}}</li>
            <div></div>
            <li @click.stop=" rSharefile ">{{t('homerightmenu.share')}}</li>
            <li @click=" rStarfile " ref="isshow">{{t('homerightmenu.target_star')}}</li>
            <div></div>
            <li @click=" rrename ">{{t('homerightmenu.rename')}}</li>
            <li @click=" rcopyfile ">{{t('homerightmenu.copyfile')}}</li>
            <li @click=" rDeletefile ">{{t('homerightmenu.deletefile')}}</li>
        </ul>
    </div>
    <!-- 重命名弹框 -->
    <el-dialog v-model=" dialogVisible " :title=" t('home.rename') " width="500" align-center>
        <input class="newname" type="text" v-model=" newname " ref="renameinput" @keydown.enter="rename1" />
        <template #footer>
            <span class="dialog-footer">
                <el-button type="primary" style="background-color: none;"  @click=" rename1 " 
                    :disabled=" newname == '' ? true : false ">
                    {{ t('home.rename_ok') }}
                </el-button>
                <el-button @click=" dialogVisible = false ">{{t('home.cancel')}}</el-button>
            </span>
        </template>
    </el-dialog>
    <div v-if=" showFileShare " class="overlay"></div>
    <FileShare v-if=" showFileShare " @close=" closeShare " :docId=" docId " :selectValue=" selectValue "
        @select-type=" onSelectType " @switch-state=" onSwitch " :shareSwitch=" shareSwitch " :pageHeight=" pageHeight ">
    </FileShare>
</template>

<script setup lang="ts">
import * as share_api from "@/apis/share"
import * as user_api from '@/apis/users'
import { Share, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { onMounted, ref, onUnmounted, nextTick } from "vue"
import { useI18n } from 'vue-i18n'
import { router } from '@/router'
import FileShare from '@/components/Document/Toolbar/Share/FileShare.vue'


const { t } = useI18n()
const isLoading = ref(false)
const showFileShare = ref<boolean>(false)
const shareSwitch = ref(true)
const pageHeight = ref(0)
const docId = ref('')
const selectValue = ref(1)
const getDoucmentList = ref<any[]>([])
const documentId = ref()
const menu = ref<HTMLElement>()
const dialogVisible = ref(false)
const renameinput = ref()
const newname = ref()
const isshow = ref<HTMLElement>()

//获取服务器我的文件列表
async function getDoucment() {
    isLoading.value = true
    try {
        const { data } = await share_api.getDoucmentListAPI() as any
        if (data == null) {
            ElMessage.closeAll('error')
            ElMessage.error({ duration: 1500, message: t('home.failed_list_tips') })
        } else {
            for (let i = 0; i < data.length; i++) {
                let { document: { size }, document_access_record: { last_access_time } } = data[i]
                data[i].document.size = sizeTostr(size)
                data[i].document_access_record.last_access_time = last_access_time.slice(0, 19)
            }
        }
        getDoucmentList.value = data
    } catch (error) {
        ElMessage.closeAll('error')
        ElMessage.error({ duration: 1500, message: t('home.failed_list_tips') })
    }
    
    isLoading.value = false
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

//变更当前文件标星状态
const Starfile = async (index: number) => {
    getDoucmentList.value[index].document_favorites.is_favorite = getDoucmentList.value[index].document_favorites.is_favorite === true ? false : true
    const doc_id = getDoucmentList.value[index].document.id
    if (getDoucmentList.value[index].document_favorites.is_favorite == true) {
        const { code } = await user_api.SetfavoriteStatus({ doc_id: doc_id, status: true })
        if (code === 0) {
            ElMessage.closeAll('success')
            ElMessage.success({ duration: 1500, message: t('home.star_ok') })
        }
    } else {
        const { code } = await user_api.SetfavoriteStatus({ doc_id: doc_id, status: false })
        if (code === 0) {
            ElMessage.closeAll('success')
            ElMessage.success({ duration: 1500, message: t('home.star_cancel') })
        }
    }
}

const rStarfile = async () => {
    documentId.value.document_favorites.is_favorite = documentId.value.document_favorites.is_favorite === true ? false : true
    const doc_id = documentId.value.document.id
    if (documentId.value.document_favorites.is_favorite == true) {
        const { code } = await user_api.SetfavoriteStatus({ doc_id: doc_id, status: true })
        if (code === 0) {
            ElMessage.closeAll('success')
            ElMessage.success({ duration: 1500, message: t('home.star_ok') })
        }
    } else {
        const { code } = await user_api.SetfavoriteStatus({ doc_id: doc_id, status: false })
        if (code === 0) {
            ElMessage.closeAll('success')
            ElMessage.success({ duration: 1500, message: t('home.star_cancel') })
        }
    }
    if (menu.value) {
        menu.value.style.display = 'none'
    }
}

const Sharefile = (scope: any) => {
    if (showFileShare.value) {
        showFileShare.value = false
        return
    }
    docId.value = scope.row.document.id
    selectValue.value = scope.row.document.doc_type !== 0 ? scope.row.document.doc_type : scope.row.document.doc_type
    showFileShare.value = true
}

const rSharefile = () => {
    if (menu.value) {
        menu.value.style.display = 'none'
    }
    if (showFileShare.value) {
        showFileShare.value = false
        return
    }
    docId.value = documentId.value.document.id
    selectValue.value = documentId.value.document.doc_type !== 0 ? documentId.value.document.doc_type : documentId.value.document.doc_type;
    showFileShare.value = true;
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

const rrename = () => {
    newname.value = documentId.value.document.name
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

const rename1 = async () => {
    const { document: { id, name } } = documentId.value
    newname.value = renameinput.value.value
    if (newname.value == '') return
    if (newname.value != name)
        try {
            const { code } = await user_api.Setfilename({ doc_id: id, name: newname.value })
            if (code === 0) {
                ElMessage.closeAll('success')
                ElMessage.success({ duration: 1500, message: t('percenter.successtips') })
                getDoucment()
            } else {
                ElMessage.closeAll('error')
                ElMessage.error({ duration: 1500, message: t('percenter.errortips1') })
            }
        } catch (error) {
            ElMessage.closeAll('error')
            ElMessage.error({ duration: 1500, message: t('home.other_tips') })
        }
    dialogVisible.value = false
}

const Deletefile = async (index: number) => {
    const { document: { id } } = getDoucmentList.value[index]
    const { code } = await user_api.MoveFile({ doc_id: id })
    if (code === 0) {
        ElMessage.closeAll('success')
        ElMessage.success({ duration: 1500, message: t('home.delete_ok_tips') })
        getDoucment()
    } else {
        ElMessage.closeAll('error')
        ElMessage.error({ duration: 1500, message: t('home.delete_no_tips') })
    }
}

const rDeletefile = async () => {
    const { document: { id } } = documentId.value
    const { code } = await user_api.MoveFile({ doc_id: id })
    if (code === 0) {
        ElMessage.closeAll('success')
        ElMessage.success({ duration: 1500, message: t('home.delete_ok_tips') })
        getDoucment()
    } else {
        ElMessage.closeAll('error')
        ElMessage.error({ duration: 1500, message: t('home.delete_no_tips') })
    }
    if (menu.value) {
        menu.value.style.display = 'none'
    }
}

const toDocument = (row: any) => {
    const docId = row.document.id
    router.push({
        name: 'document',
        query: {
            id: docId
        }
    })
}

const openDocument = () => {
    router.push({
        name: 'document',
        query: {
            id: documentId.value.document.id
        }
    })
}

const openNewWindowDocument = () => {
    const Name = 'document'
    const query = { id: documentId.value.document.id }
    const url = router.resolve({ name: Name, query: query }).href
    window.open(url, '_blank')
    if (menu.value) {
        menu.value.style.display = 'none'
    }
}

const rightmenu = (row: any, column: any, event: any) => {
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight
    const rightmenu: any = document.querySelector('.rightmenu')
    const top = event.pageY
    const left = event.pageX
    if (event.target.tagName == 'DIV') {
        rightmenu.style.left = left + 200 > viewportWidth ? (viewportWidth - 200) + "px" : left + 'px'
        rightmenu.style.top = top + 291 > viewportHeight ? (viewportHeight - 291) + 'px' : top + 'px'
        rightmenu.style.display = 'block'
    }
    nextTick(() => {
        if (isshow.value) {
            if (row.document_favorites.is_favorite == true) {
                isshow.value.innerHTML = t('homerightmenu.unstar')
            } else {
                isshow.value.innerHTML = t('homerightmenu.target_star')
            }
        }
    })
    documentId.value = row
}

const rcopyfile = async () => {
    const { document: { id } } = documentId.value
    const { code } = await user_api.Copyfile({ doc_id: id })
    if (code === 0) {
        ElMessage.closeAll('success')
        ElMessage.success({ duration: 1500, message: t('homerightmenu.copyfile_ok') })
        getDoucment()
    } else {
        ElMessage.closeAll('error')
        ElMessage.error({ duration: 1500, message: t('homerightmenu.copyfile_no') })
    }
    if (menu.value) {
        menu.value.style.display = 'none'
    }
}

const handleClickOutside = (event: MouseEvent) => {
    if (event.target instanceof Element && event.target.closest('.rightmenu') == null) {
        if (menu.value) {
            menu.value.style.display = 'none'
        }
    }
}

onMounted(() => {
    getDoucment()
    getPageHeight()
    window.addEventListener('resize', getPageHeight)
    document.addEventListener('mousedown', handleClickOutside)
})
onUnmounted(() => {
    window.removeEventListener('resize', getPageHeight)
    document.removeEventListener('mousedown', handleClickOutside)
})


function emit(arg0: string) {
    throw new Error("Function not implemented.")
}
</script>
<style lang="scss" scoped>
.newname {
    outline: none;
    height: 30px;
    width: 460px;
    box-sizing: border-box;

    &:hover {
        border-radius: 2px;
        border: 2px rgb(69, 69, 255) solid;
        border-color: rgb(69, 69, 255);
    }

    &:focus {
        border-radius: 2px;
        border: 2px rgb(69, 69, 255) solid;
        border-color: rgb(69, 69, 255);
    }
}

.el-button--primary {
    background: rgb(69, 69, 255);
    color: white;
    border-color: rgb(69, 69, 255);

    &:hover {
        background: rgba(80, 80, 255, 0.884);
    }

    &[disabled] {
        background: rgba(195, 195, 246, 0.884);
        border: 1px rgba(195, 195, 246, 0.884) solid;
    }
}

.el-button+.el-button {
    background: rgb(255, 255, 255);
    color: black;

    &:hover {
        background: rgba(208, 208, 208, 0.167);
    }
}

.rightmenu {
    display: none;
    min-width: 200px;
    min-height: 100px;
    z-index: 9999;
    position: absolute;
    background-color: white;
    padding: 10px 0;
    border-radius: 5px;
    box-shadow: rgba(0, 0, 0, 0.16) 0px 10px 36px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px;

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
                background-color: rgba(192, 192, 192, 0.3);
            }
        }

        div {
            height: 1px;
            width: auto;
            background: rgba(192, 192, 192, 0.3);
        }


    }
}

.el-icon {
    display: none;
    position: relative;
    top: 5px;

    &:hover {
        color: #6395f9;
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
    height: 50px;
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
