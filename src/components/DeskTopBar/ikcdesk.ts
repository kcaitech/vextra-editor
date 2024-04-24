// 要与kcdesktop工程同步修改
export interface IKcDesk {
    getPlatform(): string;
    close(): void; // 关闭窗口
    minimize(): void; // 最小化窗口
    toggleMaximize(): void; // 切换最大化
    move(dx: number, dy: number): void; // 移动窗口
    getFileList(): { name: string, id: string }[]; // 打开文件列表
    closeFile(id: string): void; // 关闭文档
    moveFile(id: string, index: number): void; // 移动文档位置
    offsetList(offset: number): void; // 文件列表偏移
    getListOffset(): number; // 文件列表偏移
    openFile(id: string): void; // 打开文档或者切换到对应文档
}

// 用于调效果
export class MockKcDesk implements IKcDesk {
    getPlatform(): string {
        // throw new Error("Method not implemented.");
        return "darwin";
    }
    close(): void {
        // throw new Error("Method not implemented.");
        console.log("close");
    }
    minimize(): void {
        // throw new Error("Method not implemented.");
        console.log("minimize");
    }
    toggleMaximize(): void {
        // throw new Error("Method not implemented.");
        console.log("toggleMaximize");
    }
    move(dx: number, dy: number): void {
        // throw new Error("Method not implemented.");
        console.log("move", dx, dy);
    }
    getFileList(): { name: string; id: string; }[] {
        // throw new Error("Method not implemented.");
        return [];
    }
    closeFile(id: string): void {
        // throw new Error("Method not implemented.");
    }
    moveFile(id: string, index: number): void {
        // throw new Error("Method not implemented.");
    }
    offsetList(offset: number): void {
        // throw new Error("Method not implemented.");
    }
    getListOffset(): number {
        // throw new Error("Method not implemented.");
        return 0;
    }
    openFile(id: string): void {
        // throw new Error("Method not implemented.");
    }
    
}