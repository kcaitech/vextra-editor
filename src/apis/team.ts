// 导入axios实例
import httpRequest from '@/request/index'

//获取项目申请列表
export function getTeamProjectApplyAPI(params = {}, opts = {}) {
    return httpRequest({
        url: `/documents/team/project/apply`,
        method: 'get',
        params: params,
        ...opts
    })
}

//项目加入审核
export function postTeamProjectAuditAPI(params = {}, opts = {}) {
    return httpRequest({
        url: `/documents/team/project/apply/audit`,
        method: 'post',
        data: params,
        ...opts
    })
}

//获取团队申请列表
export function getTeamApplyAPI(params = {}, opts = {}) {
    return httpRequest({
        url: `/documents/team/apply`,
        method: 'get',
        params: params,
        ...opts
    })
}

//团队加入审核
export function postTeamAuditAPI(params = {}, opts = {}) {
    return httpRequest({
        url: `/documents/team/apply/audit`,
        method: 'post',
        data: params,
        ...opts
    })
}

//获取项目文件列表
export function getDoucmentListAPI(params = {}, opts = {}) {
    return httpRequest({
        url: '/documents/',
        method: 'get',
        params: params,
        ...opts
    })
}