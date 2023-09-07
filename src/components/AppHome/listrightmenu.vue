<template>
    <!-- 右键菜单 -->
    <div class="rightmenu" ref="menu">
        <ul>
            <li v-for="item in props.items " :key="item" @click.stop="EventHandler(item)" :class="item">
                {{ itemcontent(item) }}
            </li>
        </ul>
    </div>
    <!-- 重命名弹框 -->
    <el-dialog v-model="dialogVisible" :title="t('home.rename')" width="500" align-center>
        <input class="newname" type="text" v-model="newname" ref="renameinput" @keydown.enter="rename1" />
        <template #footer>
            <span class="dialog-footer">
                <el-button type="primary" style="background-color: none;" @click="rename1"
                    :disabled="newname == '' ? true : false">
                    {{ t('home.rename_ok') }}
                </el-button>
                <el-button @click="dialogVisible = false">{{ t('home.cancel') }}</el-button>
            </span>
        </template>
    </el-dialog>
</template>
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { router } from '@/router'
import * as user_api from '@/apis/users'
import { ElMessage } from 'element-plus'
import { onMounted, ref, onUnmounted } from 'vue';

const dialogVisible = ref(false)
const newname = ref()
const renameinput = ref<HTMLInputElement>()
const menu = ref<HTMLElement>()
const { t } = useI18n()

interface data {
    document: {
        id: string
        name: string
        doc_type: number
    }
    document_favorites: {
        is_favorite: boolean
    }
}

const props = defineProps<{
    items: string[],
    data: data | undefined,
}>()

const emits = defineEmits([
    'ropen',
    'rStarfile',
    'rSharefile',
    'rRemovehistory',
    'rRemovefile',
    'rExitshare',
    'rRestorefile',
    'rDeletefile',
    'getDoucment',
    'getUserdata',
    'GetrecycleLists'
])

enum rightmenuitem {
    open = 'open',
    newtabopen = 'newtabopen',
    share = 'share',
    target_star = 'target_star',
    rename = 'rename',
    copyfile = 'copyfile',
    deletefile = 'deletefile',
    removefile = 'removefile',
    exit_share = 'exit_share',
    completely_delete = 'completely_delete',
    restore = 'restore',
    projectset = 'projectset',
    memberset = 'memberset',
    setfixed = 'setfixed',
    cancelfixed = 'cancelfixed',
    deleteproject = 'deleteproject'
}

const itemcontent = (item: string) => {
    switch (item) {
        case rightmenuitem.open:
            return t('homerightmenu.open')
        case rightmenuitem.newtabopen:
            return t('homerightmenu.newtabopen')
        case rightmenuitem.share:
            return t('homerightmenu.share')
        case rightmenuitem.target_star:
            return t('homerightmenu.target_star')
        case rightmenuitem.rename:
            return t('homerightmenu.rename')
        case rightmenuitem.copyfile:
            return t('homerightmenu.copyfile')
        case rightmenuitem.deletefile:
            return t('homerightmenu.deletefile')
        case rightmenuitem.removefile:
            return t('homerightmenu.removed_record')
        case rightmenuitem.exit_share:
            return t('homerightmenu.exit_share')
        case rightmenuitem.restore:
            return t('homerightmenu.restore')
        case rightmenuitem.completely_delete:
            return t('homerightmenu.completely_delete')
        case rightmenuitem.projectset:
            return '项目访问设置'
        case rightmenuitem.memberset:
            return '成员权限设置'
        case rightmenuitem.setfixed:
            return '固定项目'
        case rightmenuitem.cancelfixed:
            return '取消固定'
        case rightmenuitem.deleteproject:
            return '删除项目'
        default:
            return ''
    }
}

const EventHandler = (item: string) => {
    if (!props.data) return;
    const { document: { id, name } } = props.data
    if (item === rightmenuitem.open) {
        emits('ropen', id) //右键打开 
    }
    if (item === rightmenuitem.newtabopen) {
        openNewWindowDocument(id) //右键新窗口打开
    }
    if (item === rightmenuitem.share) {
        rSharefile(props.data) //右键分享
    }
    if (item === rightmenuitem.target_star) {
        rStarfile(props.data) //右键标星
    }
    if (item === rightmenuitem.rename) {
        rrename(name) //右键重命名
    }
    if (item === rightmenuitem.copyfile) {
        rcopyfile(id) //右键创建副本
    }
    if (item === rightmenuitem.deletefile) {
        rRemovefile(props.data) //右键删除文件
    }
    if (item === rightmenuitem.removefile) {
        rRemovehistory(props.data) //右键移除记录
    }
    if (item === rightmenuitem.exit_share) {
        rExitshare(props.data)//右键退出共享
    }
    if (item === rightmenuitem.restore) {
        rRestorefile(props.data) //右键恢复删除文件
    }
    if (item === rightmenuitem.completely_delete) {
        rDeletefile(props.data)//右键彻底删除文件
    }
}

//右键新窗口打开
const openNewWindowDocument = (id: string) => {
    if (menu.value) {
        menu.value.style.display = 'none'
    }
    const Name = 'document'
    const query = { id: id }
    const url = router.resolve({ name: Name, query: query }).href
    window.open(url, '_blank')
}

//右键分享
const rSharefile = (data: data) => {
    if (menu.value) {
        menu.value.style.display = 'none'
    }
    emits('rSharefile', data)
}

//右键标星
const rStarfile = (data: data) => {
    if (menu.value) {
        menu.value.style.display = 'none'
    }
    emits('rStarfile', data)
}

//右键重命名
//弹框
const rrename = (name: string) => {
    newname.value = name
    if (dialogVisible.value) {
        dialogVisible.value = false
    } else {
        dialogVisible.value = true
        setTimeout(() => {
            renameinput.value?.focus()
            renameinput.value?.select()
        }, 100)
    }
    if (menu.value) {
        menu.value.style.display = 'none'
    }

}

//重命名
const rename1 = async () => {
    if (!props.data) return;
    const { document: { id, name } } = props.data
    newname.value = renameinput.value?.value
    if (newname.value == '') return
    if (newname.value != name)
        try {
            const { code } = await user_api.Setfilename({ doc_id: id, name: newname.value })
            if (code === 0) {
                ElMessage.closeAll('success')
                ElMessage.success({ duration: 1500, message: t('percenter.successtips') })
                emits('getDoucment')
                emits('getUserdata')
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

//右键创建副本
const rcopyfile = async (id: string) => {
    const { code } = await user_api.Copyfile({ doc_id: id })
    if (code === 0) {
        ElMessage.closeAll('success')
        ElMessage.success({ duration: 1500, message: t('homerightmenu.copyfile_ok') })
        emits('getDoucment')
        emits('getUserdata')
    } else {
        ElMessage.closeAll('error')
        ElMessage.error({ duration: 1500, message: t('homerightmenu.copyfile_no') })
    }
    if (menu.value) {
        menu.value.style.display = 'none'
    }
}

//右键删除
const rRemovefile = (data: data) => {
    if (menu.value) {
        menu.value.style.display = 'none'
    }
    emits('rRemovefile', data)
}

//右键移除历史记录
const rRemovehistory = (data: data) => {
    if (menu.value) {
        menu.value.style.display = 'none'
    }
    emits('rRemovehistory', data)
}

//右键退出共享
const rExitshare = (data: data) => {
    if (menu.value) {
        menu.value.style.display = 'none'
    }
    emits('rExitshare', data)
}

//右键还原对应文件
const rRestorefile = (data: data) => {
    if (menu.value) {
        menu.value.style.display = 'none'
    }
    emits('rRestorefile', data)
}

//右键删除对应文件
const rDeletefile = (data: data) => {
    if (menu.value) {
        menu.value.style.display = 'none'
    }
    emits('rDeletefile', data)
}

//监听页面点击事件，
const handleClickOutside = (event: MouseEvent) => {
    if (event.target instanceof Element && event.target.closest('.rightmenu') == null) {
        if (menu.value) {
            menu.value.style.display = 'none'
        }
    }
}

onMounted(() => {
    document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('mousedown', handleClickOutside)
})
</script>
<style lang="scss" scoped>
.rightmenu {
    display: none;
    min-width: 200px;
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
</style>
