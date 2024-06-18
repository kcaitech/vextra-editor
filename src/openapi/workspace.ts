import { IWatchable } from "@kcdesign/data";

export namespace WorkspaceEvents {
    export const transform_change = 'transform_change'
}

export interface IWorkspace extends IWatchable {
    /**
     * 文档内容映射到element坐标系的转换矩阵
     */
    // get matrix(): Matrix;
    /**
     * 文档内容所在dom元素
     */
    get element(): HTMLElement | undefined;

    translate(x: number, y: number): void;
    scale(sx: number, sy: number): void;
    doc2view(point: {
        x: number;
        y: number;
    }): {
        x: number;
        y: number;
    };
    doc2view(x: number, y: number): {
        x: number;
        y: number;
    };
    view2doc(point: {
        x: number;
        y: number;
    }): {
        x: number;
        y: number;
    };
    view2doc(x: number, y: number): {
        x: number;
        y: number;
    };
}