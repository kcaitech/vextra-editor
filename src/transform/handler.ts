/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Context } from "@/context";
import { WorkSpace } from "@/context/workspace";
import { AsyncApiCaller, PageView, ShapeView } from "@kcdesign/data";
import { Tool } from "@/context/tool";
import { KeyboardMgr } from "@/keyboard";

export type FrameLike = {
    x: number;
    y: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
};

export class TransformHandler {
    context: Context;
    workspace: WorkSpace;

    page: PageView;

    shiftStatus: boolean = false;
    altStatus: boolean = false;
    ctrlStatus: boolean = false;
    alignPixel: boolean;

    asyncApiCaller: AsyncApiCaller | undefined;
    private boardMgr: KeyboardMgr;

    constructor(context: Context, event?: MouseEvent) {
        this.context = context;
        this.workspace = context.workspace;
        this.page = context.selection.selectedPage!;

        if (event) {
            this.shiftStatus = event.shiftKey;
            this.altStatus = event.altKey;
            this.ctrlStatus = event.ctrlKey || event.metaKey;
        }

        this.alignPixel = context.user.isPixelAlignMent;
        this.beforeTransform();
        this.boardMgr = new KeyboardMgr(context)
        this.boardMgr.addEventListener('keydown', this.__keydown);
        this.boardMgr.addEventListener('keyup', this.__keyup);
    }

    protected beforeTransform() {
        this.context.menu.menuMount(); // 关闭已打开的弹窗
        this.context.cursor.cursor_freeze(true); // 禁用光标自动变换
        this.workspace.setCtrl('controller'); // 将编辑器控制权交给控件
    }

    protected keydown(event: KeyboardEvent) {
    }

    protected keyup(event: KeyboardEvent) {
    }

    private __keydown = this.keydown.bind(this);
    private __keyup = this.keyup.bind(this);

    fulfil() {
        const context = this.context;

        this.asyncApiCaller?.commit();
        context.assist.reset();
        this.workspace.setCtrl('page');
        context.cursor.cursor_freeze(false);

        this.boardMgr.removeEventListener('keydown', this.__keydown);
        this.boardMgr.removeEventListener('keyup', this.__keyup);
    }

    updateCtrlView(rule: number) {
        this.context.nextTick(this.context.selection.selectedPage!, () => {
            this.workspace.notify(WorkSpace.SELECTION_VIEW_UPDATE);
            if (rule) this.context.tool.notify(Tool.RULE_RENDER);
        })
    }
}

/**
 * @description 额外考虑一些限制场景
 */
export class BoundHandler extends TransformHandler {
    private lockedMap: Map<ShapeView, boolean> = new Map();

    constructor(context: Context, event?: MouseEvent) {
        super(context, event);
    }

    isLocked(view: ShapeView) {
        const status = this.lockedMap.get(view);
        if (status === undefined) {
            let v: ShapeView | undefined = view;
            while (v) {
                if (v.isLocked) {
                    this.lockedMap.set(view, true);
                    return true;
                }
                v = v.parent;
            }
            this.lockedMap.set(view, false);
            return false
        } else return status;
    }
}