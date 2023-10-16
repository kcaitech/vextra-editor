// 导入axios实例
import httpRequest from '@/request/index'

//获取文档评论
export function getDocumentCommentAPI(params = {}, opts = {}) {
    return httpRequest({
        url: `/documents/comments`,
        method: 'get',
        params: params,
        ...opts
    })
}

// 创建评论
export function createCommentAPI(params = {}, opts = {}) {
    return httpRequest({
        url: `/documents/comment`,
        method: 'post',
        data: params,
        ...opts
    })
}

//设置评论状态
export function setCommentStatusAPI(params = {}, opts = {}) {
    return httpRequest({
        url: `/documents/comment/status`,
        method: 'put',
        data: params,
        ...opts
    })
}

//编辑评论
export function editCommentAPI(params = {}, opts = {}) {
    return httpRequest({
        url: `/documents/comment`,
        method: 'put',
        data: params,
        ...opts
    })
}

//删除评论
export function deleteCommentAPI(params = {}, opts = {}) {
    return httpRequest({
        url: `/documents/comment`,
        method: 'delete',
        params: params,
        ...opts
    })
}