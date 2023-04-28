// 导入axios实例
import httpRequest from '@/request/index'

//获取分享列表
export function getShareListAPI(params = {}, opts = {}) {
    return httpRequest({
        url: `/documents/shares`,
        method: 'get',
        params: params,
        ...opts
    })
}

// getShareListAPI({id:1}, {headers: {}, timeout: 1000})

//获取文档列表
export function getDoucmentListAPI() {
    return httpRequest({
        url: '/documents',
        method: 'get'
    })
}

//获取文档信息
export function getDocumentInfoAPI(id: string) {
    return httpRequest({
        url: `/documents/info/${id}`,
        method: 'get'
    })
}

//设置分享类型
export function setShateTypeAPI(id: string, type: number) {
    return httpRequest({
        url: '/documents/shares/set',
        method: 'post',
        data: {
            doc_id: id,
            doc_type: type
        }
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
export function delShareAuthorityAPI(id: number) {
    return httpRequest({
        url: `/documents/shares/${id}`,
        method: 'delete'
    })
}

// 申请文档权限
export function postDocumentAuthorityAPI(id: string, type: number) {
    return httpRequest({
        url: '/documents/shares/apply',
        method: 'post',
        data: {
            doc_id: id,
            perm_type: type
        }
    })
}

// 获取申请列表
export function getApplyListAPI(id: string) {
    return httpRequest({
        url: `/documents/shares/apply/${id}`,
        method: 'get'
    })
}

// 权限申请审核
export function promissionApplyAudit(id: number, code: number) {
    return httpRequest({
        url: '/documents/shares/apply/audit',
        method: 'post',
        data: {
            apply_id: id,
            approval_code: code
        }
    })
}
