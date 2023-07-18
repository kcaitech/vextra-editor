export enum TunnelType {
    DocOp = 0,
    DocResourceUpload
}

export const TunnelTypeStr: Record<TunnelType, string> = {
    [TunnelType.DocOp]: "文档操作",
    [TunnelType.DocResourceUpload]: "文档资源上传",
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
}

export enum ServerCmdType {
    InitResult = 0, // 返回初始化结果
    CmdReturn, // 返回cmd执行结果
    CloseTunnel, // 关闭一条虚拟通道
    TunnelData, // 虚拟通道数据
}

export enum CmdStatus {
    Success = "success",
    Fail = "fail",
}

export enum DataType {
    Text = 1,
    Binary = 2,
}

export type TunnelCmd = {
    tunnel_id?: string,
    data_type?: DataType,
    data?: any,
}

export type SendToServerCmd = {
    cmd_id: string,
} & TunnelCmd

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
}

export type CmdResult = {
    status: CmdStatus,
    message?: string,
    data?: any,
}
