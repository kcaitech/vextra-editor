// 要与kcdesktop工程同步修改
export interface IKcDesk {
    // os
    osPlatform(): string;

    // window
    winClose(): void; // 关闭窗口
    winMinimize(): void; // 最小化窗口
    winToggleMaximize(): void; // 切换最大化
    winMove(dx: number, dy: number): void; // 移动窗口

    // files
    fileGetList(): { name: string, id: string }[]; // 打开文件列表
    fileWatchList(watcher: (list: { name: string, id: string }[]) => void): void;
    fileClose(id: string): void; // 关闭文档
    fileMove(id: string, index: number): void; // 移动文档位置
    fileOffsetList(offset: number): void; // 文件列表偏移
    fileGetListOffset(): number; // 文件列表偏移
    fileOpen(id: string, args: string): void; // 打开文档或者切换到对应文档
    fileNew(): void;
}

// 用于调效果
export class MockKcDesk implements IKcDesk {
    osPlatform(): string {
        // throw new Error("Method not implemented.");
        return "darwin";
    }
    winClose(): void {
        // throw new Error("Method not implemented.");
        console.log("close");
    }
    winMinimize(): void {
        // throw new Error("Method not implemented.");
        console.log("minimize");
    }
    winToggleMaximize(): void {
        // throw new Error("Method not implemented.");
        console.log("toggleMaximize");
    }
    winMove(dx: number, dy: number): void {
        // throw new Error("Method not implemented.");
        console.log("move", dx, dy);
    }
    fileGetList(): { name: string; id: string; }[] {
        // throw new Error("Method not implemented.");
        return [];
    }
    fileWatchList(watcher: (list: { name: string; id: string; }[]) => void): void {

    }
    fileClose(id: string): void {
        // throw new Error("Method not implemented.");
    }
    fileMove(id: string, index: number): void {
        // throw new Error("Method not implemented.");
    }
    fileOffsetList(offset: number): void {
        // throw new Error("Method not implemented.");
    }
    fileGetListOffset(): number {
        // throw new Error("Method not implemented.");
        return 0;
    }
    fileOpen(id: string): void {
        // throw new Error("Method not implemented.");
    }
    fileNew(): void {

    }
}