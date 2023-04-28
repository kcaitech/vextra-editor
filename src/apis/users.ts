// 导入axios实例
import httpRequest from '@/request/index'


const data = JSON.stringify({
    "nickname": "1"
 });

// 登录请求
export function PostLogin() {
    return httpRequest({
        url: '/auth/login/wx',
        method: 'post',
        data:data,
        headers: {
            
        },

    })

}


// 获取用户信息
export function GetInfo() {
    return httpRequest({
        url: '/users/info',
        method: 'get',
        headers: {

        }
    })
}

//获取用户文档
export function GetDocumentsList() {
    return httpRequest({
        url: '/documents',
        method: 'get',
        headers: {

        }
    })
}