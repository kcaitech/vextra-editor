// 导入axios实例
import httpRequest from '@/request/index'

//获取分享列表
export function getShareListAPI(params = {}, opts = {}) {
    return httpRequest({
        url: `/documents/shares/all`,
        method: 'get',
        params: params,
        ...opts
    })
}

// getShareListAPI({id:1}, {headers: {}, timeout: 1000})

//获取文档列表
export function getDoucmentListAPI() {
    return httpRequest({
        url: '/documents/',
        method: 'get'
    })
}

//获取文档权限
export function getDocumentAuthorityAPI(params = {}, opts = {}) {
    return httpRequest({
        url: `/documents/permission`,
        method: 'get',
        params: params,
        ...opts
    })
}

//获取文档密钥
export function getDocumentKeyAPI(params = {}, opts = {}) {
    return httpRequest({
        url: `/documents/access_key`,
        method: 'get',
        params: params,
        ...opts
    })
}

//获取文档信息
export function getDocumentInfoAPI(params = {}, opts = {}) {
    return httpRequest({
        url: `/documents/info`,
        method: 'get',
        params: params,
        ...opts
    })
}

//设置分享类型
export function setShateTypeAPI(params = {}, opts = {}) {
    return httpRequest({
        url: '/documents/shares/set',
        method: 'put',
        data: params,
        ...opts
    })
}

//修改分享权限
export function putShareAuthorityAPI(params = {}, opts = {}) {
    return httpRequest({
        url: '/documents/shares',
        method: 'put',
        data: params,
        ...opts
    })
}

//移除分享权限
export function delShareAuthorityAPI(params = {}, opts = {}) {
    return httpRequest({
        url: `/documents/shares`,
        method: 'delete',
        params: params,
        ...opts
    })
}

// 申请文档权限
export function postDocumentAuthorityAPI(params = {}, opts = {}) {
    return httpRequest({
        url: '/documents/shares/apply',
        method: 'post',
        data: params,
        ...opts
    })
}

// 获取申请列表
export function getApplyListAPI(params = {}, opts = {}) {
    return httpRequest({
        url: `/documents/shares/apply`,
        method: 'get',
        params: params,
        ...opts
    })
}

// 权限申请审核
export function promissionApplyAuditAPI(params = {}, opts = {}) {
    return httpRequest({
        url: '/documents/shares/apply/audit',
        method: 'post',
        data: params,
        ...opts
    })
}
