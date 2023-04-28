// 导入axios实例
import httpRequest from '@/request/index'


const data = JSON.stringify({
    "nickname": "1"
 });

// 登录请求
export function PostLogin() {
    return httpRequest({
        url: '/v1/auth/login',
        method: 'post',
        data:data,
        headers: {
            
        },

    })

}


// 获取用户信息
export function GetInfo() {
    return httpRequest({
        url: '/v1/users/info',
        method: 'get',
        headers: {

        }
    })
}

//获取用户文档
// 获取用户信息
export function GetDocumentsList() {
    return httpRequest({
        url: '/v1/documents',
        method: 'get',
        headers: {

        }
    })
}