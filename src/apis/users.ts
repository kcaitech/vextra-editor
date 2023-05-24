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
// get delete用params put post用data
export function SetfavoriteStatus(data = {}, ops = {}) {
    return httpRequest({
        url: 'documents/favorites',
        method: 'put',
        data:data,
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
export function RecoverFile(data = {}, ops = {}) {
    return httpRequest({
        url: 'documents/recycle_bin',
        method: 'put',
        data:data,
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

//退出共享
export function ExitSharing(params = {}, ops = {}) {
    return httpRequest({
        url: 'documents/share',
        method: 'delete',
        params:params,
        ...ops
    })
}

//移动文件到回收站
export function MoveFile(params = {}, ops = {}) {
    return httpRequest({
        url: 'documents/',
        method: 'delete',
        params:params,
        ...ops
    })
}

//收到的共享文件列表
export function ShareLists(params = {}, ops = {}) {
    return httpRequest({
        url: 'documents/shares',
        method: 'get',
        params:params,
        ...ops
    })
}