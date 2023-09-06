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

//获取项目回收站列表
export function GetrecycleList(params = {}, ops = {}) {
    return httpRequest({
        url: 'documents/recycle_bin',
        method: 'get',
        params: params,
        ...ops
    })
}

//获取项目收藏列表
export function getProjectFavoriteListsAPI(params = {}, ops = {}) {
    return httpRequest({
        url: '/documents/team/project/favorite/list',
        method: 'get',
        params: params,
        ...ops
    })
}

//是否收藏
export function setProjectIsFavoriteAPI(params = {}, ops = {}) {
    return httpRequest({
        url: '/documents/team/project/favorite',
        method: 'put',
        data: params,
        ...ops
    })
}

//设置项目信息
export function setProjectInfoAPI(params = {}, ops = {}) {
    return httpRequest({
        url: '/documents/team/project/info',
        method: 'put',
        data: params,
        ...ops
    })
}

//设置项目邀请信息
export function setProjectInvitedInfoAPI(params = {}, ops = {}) {
    return httpRequest({
        url: '/documents/team/project/invited',
        method: 'put',
        data: params,
        ...ops
    })
}

// 获取项目邀请信息
export function getProjectInvitedInfoAPI(params = {}, ops = {}) {
    return httpRequest({
        url: '/documents/team/project/info/invited',
        method: 'get',
        params: params,
        ...ops
    })
}

//申请加入项目
export function applyJoinProjectAPI(params = {}, ops = {}) {
    return httpRequest({
        url: '/documents/team/project/apply',
        method: 'post',
        data: params,
        ...ops
    })
}

//获取项目列表
export function GetprojectLists(params = {}, ops = {}) {
    return httpRequest({
        url: '/documents/team/project/list',
        method: 'get',
        params: params,
        ...ops
    })
}

//获取项目成员列表
export function getProjectMemberListAPI(params = {}, ops = {}) {
    return httpRequest({
        url: '/documents/team/project/member/list',
        method: 'get',
        params: params,
        ...ops
    })
}

//获取团队成员列表
export function getTeamMemberListAPI(params = {}, ops = {}) {
    return httpRequest({
        url: '/documents/team/member/list',
        method: 'get',
        params: params,
        ...ops
    })
}

//退出项目
export function exitProjectAPI(params = {}, ops = {}) {
    return httpRequest({
        url: '/documents/team/project/exit',
        method: 'post',
        data: params,
        ...ops
    })
}

//设置项目成员权限
export function setProjectmemberPermAPI(params = {}, ops = {}) {
    return httpRequest({
        url: '/documents/team/project/member/perm',
        method: 'put',
        data: params,
        ...ops
    })
}

//将成员移出项目组
export function delProjectmemberAPI(params = {}, ops = {}) {
    return httpRequest({
        url: '/documents/team/project/member',
        method: 'delete',
        params: params,
        ...ops
    })
}

//转让项目创建者
export function transferProjectCreatorAPI(params = {}, ops = {}) {
    return httpRequest({
        url: '/documents/team/project/creator',
        method: 'put',
        data: params,
        ...ops
    })
}