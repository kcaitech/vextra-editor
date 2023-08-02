export enum TunnelType {
    DocOp = 0,
    DocResourceUpload,
    DocCommentOp,
    DocUpload,
    NetworkStatus = 255,
}

export const TunnelTypeStr: Record<TunnelType, string> = {
    [TunnelType.DocOp]: "文档操作",
    [TunnelType.DocResourceUpload]: "文档资源上传",
    [TunnelType.DocCommentOp]: "文档评论操作",
    [TunnelType.DocUpload]: "文档上传",
    [TunnelType.NetworkStatus]: "监听网络状态",
}

export enum NetworkStatusType {
    Online = 0,
    Offline,
}

export type CommunicationInfo = {
    name: string,
    id: string,
    token: string,
    tunnelType: TunnelType,
    data?: any,
}

export enum ClientCmdType {
    Return = 0, // 返回cmd执行结果
    OpenTunnel, // 打开一条虚拟通道
    CloseTunnel, // 关闭一条虚拟通道
    TunnelData, // 虚拟通道数据
    Heartbeat = 255, // 心跳包
    HeartbeatResponse = 254, // 心跳包响应
}

export enum ServerCmdType {
    InitResult = 0, // 返回初始化结果
    CmdReturn, // 返回cmd执行结果
    CloseTunnel, // 关闭一条虚拟通道
    TunnelData, // 虚拟通道数据
    Heartbeat = 255, // 心跳包
    HeartbeatResponse = 254, // 心跳包响应
}

export enum CmdStatus {
    Success = "success",
    Fail = "fail",
}

export enum DataType {
    Text = 1,
    Binary = 2,
}

export type TunnelCmdData = {
    cmd_id: string,
    tunnel_id?: string,
    data_type?: DataType,
    data?: any,
}

export enum CmdMessage {
    TunnelIdError = "tunnel_id错误",
}

export type ClientCmd = {
    cmd_type: ClientCmdType,
    cmd_id: string,
    tunnel_type?: TunnelType,
    status?: CmdStatus,
    message?: string,
    data?: any,
}

export type ServerCmd = {
    cmd_type: ServerCmdType,
    cmd_id: string,
    status?: CmdStatus,
    message?: string,
    data?: any,
}

export type ClientPostData = {
    cmdId?: string,
    isListened?: boolean,
    dataType: DataType,
    data?: any,
    close?: boolean,
}

export type WorkerPostData = {
    cmdId?: string,
    isListened?: boolean,
    dataType?: DataType,
    data: any,
    close?: boolean,
}

export type CmdResult = {
    status: CmdStatus,
    message?: string,
    data?: any,
}
