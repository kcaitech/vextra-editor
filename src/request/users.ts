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
        params: params,
        ...ops
    })
}


// 移除历史记录
export function DeleteList(params = {}, ops = {}) {
    return httpRequest({
        url: 'documents/access_record',
        method: 'delete',
        params: params,
        ...ops
    })
}

// 获取收藏列表
export function GetfavoritesList(params = {}, ops = {}) {
    return httpRequest({
        url: 'documents/favoritess',
        method: 'get',
        params: params,
        ...ops
    })
}

//设置收藏列表
// get delete用params put post用data
export function SetfavoriteStatus(data = {}, ops = {}) {
    return httpRequest({
        url: 'documents/favorites',
        method: 'put',
        data: data,
        ...ops
    })
}

//获取回收站列表
export function GetrecycleList(params = {}, ops = {}) {
    return httpRequest({
        url: 'documents/recycle_bin',
        method: 'get',
        params: params,
        ...ops
    })
}

//恢复文件
export function RecoverFile(data = {}, ops = {}) {
    return httpRequest({
        url: 'documents/recycle_bin',
        method: 'put',
        data: data,
        ...ops
    })
}

//彻底删除文件
export function DeleteFile(params = {}, ops = {}) {
    return httpRequest({
        url: 'documents/recycle_bin',
        method: 'delete',
        params: params,
        ...ops
    })
}

//退出共享
export function ExitSharing(params = {}, ops = {}) {
    return httpRequest({
        url: 'documents/share',
        method: 'delete',
        params: params,
        ...ops
    })
}

//移动文件到回收站
export function MoveFile(params = {}, ops = {}) {
    return httpRequest({
        url: 'documents/',
        method: 'delete',
        params: params,
        ...ops
    })
}

//收到的共享文件列表
export function ShareLists(params = {}, ops = {}) {
    return httpRequest({
        url: 'documents/shares',
        method: 'get',
        params: params,
        ...ops
    })
}

//设置用户头像
export function Setusericon(data = {}, ops = {}) {
    return httpRequest({
        url: '/users/info/avatar',
        method: 'put',
        data: data,
        ...ops
    })
}

//设置用户昵称
export function Setusernickname(data = {}, ops = {}) {
    return httpRequest({
        url: '/users/info/nickname',
        method: 'put',
        data: data,
        ...ops
    })
}

//文件重命名
export function Setfilename(data = {}, ops = {}) {
    return httpRequest({
        url: '/documents/name',
        method: 'put',
        data: data,
        ...ops
    })
}

//复制文档
export function Copyfile(data = {}, ops = {}) {
    return httpRequest({
        url: '/documents/copy',
        method: 'post',
        data: data,
        ...ops
    })
}

//创建团队
export function CreateTeam(data = {}, ops = {}) {
    return httpRequest({
        url: '/documents/team',
        method: 'post',
        data: data,
        ...ops
    })
}

//获取团队列表
export function GetteamList(params = {}, ops = {}) {
    return httpRequest({
        url: '/documents/team/list',
        method: 'get',
        params: params,
        ...ops
    })
}

//获取团队成员
export function GetteamMember(params = {}, ops = {}) {
    return httpRequest({
        url: '/documents/team/member/list',
        method: 'get',
        params: params,
        ...ops
    })
}


//设置团队信息
export function Setteaminfo(data = {}, ops = {}) {
    return httpRequest({
        url: '/documents/team/info',
        method: 'put',
        data: data,
        ...ops
    })
}

//设置团队邀请选项
export function Setteaminviteinfo(data = {}, ops = {}) {
    return httpRequest({
        url: '/documents/team/invited',
        method: 'put',
        data: data,
        ...ops
    })
}

//设置团队成员权限
export function Setteammemberperm(data = {}, ops = {}) {
    return httpRequest({
        url: '/documents/team/member/perm',
        method: 'put',
        data: data,
        ...ops
    })
}

//转移团队创建者
export function Setteamcreator(data = {}, ops = {}) {
    return httpRequest({
        url: '/documents/team/creator',
        method: 'put',
        data: data,
        ...ops
    })
}

//获取团队信息
export function Getteaminfo(params = {}, ops = {}) {
    return httpRequest({
        url: '/documents/team/info/invited',
        method: 'get',
        params: params,
        ...ops
    })
}

//申请加入团队
export function JoinTeam(data = {}, ops = {}) {
    return httpRequest({
        url: '/documents/team/apply',
        method: 'post',
        data: data,
        ...ops
    })
}

//获取团队信息
export function Getjoinlist(params = {}, ops = {}) {
    return httpRequest({
        url: '/documents/team/apply',
        method: 'get',
        params: params,
        ...ops
    })
}

//离开团队
export function Leaveteam(data = {}, ops = {}) {
    return httpRequest({
        url: '/documents/team/exit',
        method: 'post',
        data: data,
        ...ops
    })
}

//移除团队成员
export function Deletteamemember(params = {}, ops = {}) {
    return httpRequest({
        url: '/documents/team/member',
        method: 'delete',
        params: params,
        ...ops
    })
}

//解散团队
export function Disbandteam(params = {}, ops = {}) {
    return httpRequest({
        url: '/documents/team',
        method: 'delete',
        params: params,
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

//创建项目
export function CreateProject(data = {}, ops = {}) {
    return httpRequest({
        url: '/documents/team/project',
        method: 'post',
        data: data,
        ...ops
    })
}

//反馈
export function Feedback(data = {}, ops = {}) {
    return httpRequest({
        url: '/documents/feedback',
        method: 'post',
        data: data,
        ...ops
    })
}

// 刷新token
export function RefreshToken(params = {}, ops = {}) {
    return httpRequest({
        url: 'auth/refresh_token',
        method: 'post',
        data: params,
        ...ops
    })

}

//获取文档列表
export function getDoucmentListAPI() {
    return httpRequest({
        url: '/documents/',
        method: 'get'
    })
}



