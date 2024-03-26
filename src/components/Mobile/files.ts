import i18n from '@/i18n'
import * as user_api from '@/request/users'
import { ElMessage } from 'element-plus'
import { ref } from 'vue'

//获取服务器最近列表
export async function getRecentlydata() {
    try {
        const { data } = await user_api.GetDocumentsList() as any
        for (let i = 0; i < data.length; i++) {
            data[i].project_perm = undefined;
            let { document: { size }, document_access_record: { last_access_time } } = data[i]
            data[i].document.size = sizeTostr(size)
            data[i].last = true
            data[i].document_access_record.last_access_time = last_access_time.slice(0, 19)
        }
        return data
    } catch (error: any) {
        return error.message
    }
}

//获取服务器共享列表
export async function getSharedata() {
    try {
        const { data } = await user_api.ShareLists()
        for (let i = 0; i < data.length; i++) {
            data[i].project_perm = undefined;
            let { document: { size, created_at } } = data[i]
            data[i].last = false
            data[i].document.size = sizeTostr(size)
            data[i].document.created_at = created_at.slice(0, 19)
        }
        return data
    } catch (error: any) {
        return error.message
    }
}

//获取服务器标星列表
export async function getStardata() {
    try {
        const { data } = await user_api.GetfavoritesList()
        for (let i = 0; i < data.length; i++) {
            data[i].project_perm = undefined;
            let { document: { size }, document_access_record: { last_access_time } } = data[i]
            data[i].last = true
            data[i].document.size = sizeTostr(size)
            data[i].document_access_record.last_access_time = last_access_time.slice(0, 19)
        }
        return { state: 'success', data:data }
    } catch (error: any) {
        return { state: 'failed', data:error }
    }
}

//
//获取服务器我的文件列表
export async function getDoucment() {
    try {
        const { data } = await user_api.getDoucmentListAPI() as any
        for (let i = 0; i < data.length; i++) {
            let { document: { size, created_at } } = data[i]
            data[i].last = false
            data[i].document.size = sizeTostr(size)
            data[i].document.created_at = created_at.slice(0, 19)
        }
        return data
    } catch (error: any) {
        return error.message
    }
}


//更改标星状态
export async function changeStar(id: number, b: boolean) {
    try {
        const { code } = await user_api.SetfavoriteStatus({ doc_id: id, status: !b })
        if (code === 0) {
            return true
        } else {
            return false
        }
    } catch (error: any) {
        if (error.data.code === 401) {
            return
        } else {
            ElMessage.closeAll('error')
        }
    }
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
