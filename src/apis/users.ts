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

//获取用户文档
// 获取用户信息
export function GetDocumentsList(params = {}, ops = {}) {
    return httpRequest({
        url: '/documents/access_records',
        method: 'get',
        params:params,
        ...ops
    })
}