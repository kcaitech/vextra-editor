// 导入axios实例
import httpRequest from '@/request/index'



// 登录请求
export function PostLogin(params = {}, ops = {}) {
    return httpRequest({
        url: 'auth/login/wx',
        method: 'post',
        data: params,
        ...ops
    })

}


// 获取用户信息
export function GetInfo(params = {}, ops = {}) {
    return httpRequest({
        url: 'users/info',
        method: 'get',
        params: params,
        ...ops
    })
}

//获取历史记录
export function GetDocumentsList(params = {}, ops = {}) {
    return httpRequest({
        url: 'documents/access_records',
        method: 'get',
        params:params,
        ...ops
    })
}


// 移除历史记录
export function DeleteList(params = {}, ops = {}) {
    return httpRequest({
        url: 'documents/access_record',
        method: 'delete',
        params:params,
        ...ops
    })
}

// 获取收藏列表
export function GetfavoritesList(params = {}, ops = {}) {
    return httpRequest({
        url: 'documents/favorites',
        method: 'get',
        params:params,
        ...ops
    })
}

//设置收藏列表
export function SetfavoriteStatus(params = {}, ops = {}) {
    return httpRequest({
        url: 'documents/favorite',
        method: 'put',
        params:params,
        ...ops
    })
}

//获取回收站列表
export function GetrecycleList(params = {}, ops = {}) {
    return httpRequest({
        url: 'documents/recycle_bin',
        method: 'get',
        params:params,
        ...ops
    })
}

//恢复文件
export function RecoverFile(params = {}, ops = {}) {
    return httpRequest({
        url: 'documents/recycle_bin',
        method: 'put',
        params:params,
        ...ops
    })
}

//彻底删除文件
export function DeleteFile(params = {}, ops = {}) {
    return httpRequest({
        url: 'documents/recycle_bin',
        method: 'delete',
        params:params,
        ...ops
    })
}