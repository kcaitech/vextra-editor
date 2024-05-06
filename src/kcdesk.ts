
interface IKcDesk {
    // os
    osPlatform(): string;
    osOpenFile(localfile: string): Promise<File | undefined>;

    // window
    winClose(): void; // 关闭窗口
    winMinimize(): void; // 最小化窗口
    winToggleMaximize(): void; // 切换最大化

    // files
    fileGetList(): Promise<{ name: string, viewid: number }[]>; // 打开文件列表
    fileWatchList(watcher: (list: { name: string, fid: string | undefined, viewid: number }[]) => void): void;
    fileClose(viewid: number): void; // 关闭文档
    fileShow(viewid: number): void; // 切换文档

    fileMove(viewid: number, index: number): void; // 移动文档位置
    fileOffsetList(offset: number): void; // 文件列表偏移
    fileGetListOffset(): number; // 文件列表偏移
    fileOpen(id: string, name: string, args: string): void; // 打开文档或者切换到对应文档
    fileOpenLocal(filter: string): void; // 打开文档或者切换到对应文档
    fileNew(name: string): void;
}

const _desk_secret = 'kcdesk_07444f3a-343d-45a7-bd37-635fc9a26871';
export default ((window as any)[_desk_secret]) as IKcDesk | undefined;
