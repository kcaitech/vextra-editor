/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Matrix, PathShapeView } from "@kcdesign/data";
import { Context } from "@/context";
import { XY } from "@/context/selection";

type SliceStruct = {
    segmentIndex: number;
    index: number;
    start: XY;
    handle1?: XY;
    handle2?: XY;
    end: XY;
    path: string;
    insert: XY;
}

type InsertPortStatus = {
    visible: boolean;
    port: XY;
}

/**
 * @description todo 钢笔路径骨架建造器，迟早一定要做的事情
 */
export class MapBuilder {
    private context: Context;
    private view: PathShapeView;

    struct: SliceStruct[];

    constructor(context: Context, view: PathShapeView) {
        this.context = context;
        this.view = view;
        this.struct = [];
    }

    private getSlicePath(slice: SliceStruct) {
        const {start, handle1, handle2, end} = slice;
        if (handle1 && handle2) {
            return `C ${handle1.x} ${handle1.y} ${handle2.x} ${handle2.y} ${end.x} ${end.y}`;
        } else if (handle1 || handle2) {
            return handle1 ? `Q ${handle1.x} ${handle1.y} ${end.x} ${end.y}` : `Q ${handle2!.x} ${handle2!.y} ${end.x} ${end.y}`;
        } else {
            return `L ${end.x} ${end.y}`;
        }
    }

    getStructAfterTransform(transform: Matrix) {
        return this.struct.map(stc => {
            const target: SliceStruct = {
                segmentIndex: stc.segmentIndex,
                index: stc.index,
                start: transform.computeCoord3(stc.start),
                end: transform.computeCoord3(stc.end),
                insert: transform.computeCoord3(stc.insert),
                path: stc.path // need update
            }

            if (stc.handle1) target["handle1"] = transform.computeCoord3(stc.handle1);
            if (stc.handle2) target["handle2"] = transform.computeCoord3(stc.handle2);


            return target;
        });
    }

    build() {
    }

    assist(mouse: MouseEvent) {
    }
}