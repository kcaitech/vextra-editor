export enum TunnelType {
    DocOp = 0,
}

export type CommunicationInfo = {
    name: string,
    id: string,
    token: string,
    tunnelType: number,
}

export enum ClientCmdType {
    OpenTunnel = 0, // 打开一条虚拟通道
    CloseTunnel, // 关闭一条虚拟通道
    TunnelData, // 虚拟通道数据
}

export enum ServerCmdType {
    InitResult = 0, // 返回初始化结果
    CmdReturn, // 返回cmd执行结果
    CloseTunnel, // 关闭一条虚拟通道
    TunnelData, // 虚拟通道数据
}

export enum ServerCmdStatus {
    Success = "success",
    Fail = "fail",
}

export enum DataType {
    Text = 1,
    Binary = 2,
}

export type ServerCmd = {
    cmd_type: ServerCmdType,
    cmd_id: string,
    status?: ServerCmdStatus,
    message?: string,
    data?: any,
}

export type ClientPostData = {
    cmdId?: string,
    isListened?: boolean,
    dataType: DataType,
    data?: any,
}

export type WorkerPostData = {
    cmdId?: string,
    isListened?: boolean,
    dataType?: DataType,
    data: any,
}
