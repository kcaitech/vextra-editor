/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { onMounted, onUnmounted } from "vue";
import { Context } from "@/context";
import { Selection, XY } from "@/context/selection";
import { useI18n } from 'vue-i18n';
import {
    check_drag_action,
    remove_move_and_up_from_document,
    shapes_picker,
    shutdown_menu
} from "@/utils/mouse";
import { TranslateHandler } from "@/transform/translate/translate";
import { ContactLineView } from "@kcdesign/data";
import { DBL_CLICK } from "@/const";

function useControllerCustom(context: Context, i18nT: Function) {
    let timer: any;
    const duration: number = DBL_CLICK; // 双击判定时长 ms
    let isDragging = false;
    let editing: boolean = false;
    let transporter: TranslateHandler | undefined = undefined;
    let downXY: XY = {x: 0, y: 0};

    function handleDblClick() {
        console.log('emit dbl');
    }

    function isMouseOnContent(e: MouseEvent): boolean {
        return !!(e.target as Element)?.closest(`#content`);
    }

    function mousedown(e: MouseEvent) {
        if (context.workspace.isPageDragging) {
            return;
        }

        if (isElement(e)) {
            if (timer) {
                handleDblClick();
            }

            initTimer();
            pre_to_translate(e);
            return;
        }

        if (!isMouseOnContent(e)) {
            return;
        }

        const selection = context.selection;
        if (!selection.hoveredShape) {
            selection.resetSelectShapes();
        } else {
            selection.selectShape(selection.hoveredShape);
            context.workspace.preToTranslating(e);
        }
    }

    async function mousemove(e: MouseEvent) {
        if (e.buttons !== 1) {
            return;
        }

        if (isDragging) {
            transporter?.execute(e);
        } else if (check_drag_action(e, downXY)) {
            transporter?.createApiCaller();

            isDragging = true;
        }
    }

    function mouseup(e: MouseEvent) {
        if (e.button !== 0) {
            return;
        }

        if (isDragging) {
            isDragging = false;
        } else {
            shapes_picker(e, context, context.workspace.getRootXY(downXY as MouseEvent));
        }

        transporter?.fulfil();
        transporter = undefined;

        remove_move_and_up_from_document(mousemove, mouseup);
    }

    function pre_to_translate(e: MouseEvent) {
        shutdown_menu(e, context);

        const shape = context.selection.selectedShapes[0] as ContactLineView;

        if (shape.data.from || shape.data.to) {
            return;
        }

        document.addEventListener('mouseup', mouseup);

        if (!context.workspace.can_translate(e)) {
            return;
        }

        transporter = new TranslateHandler(context, e, context.selection.selectedShapes);

        document.addEventListener('mousemove', mousemove);
    }

    function initController() {
        initTimer();
    }

    function initTimer() {
        clearTimeout(timer);
        timer = setTimeout(() => {
            clearTimeout(timer);
            timer = null;
        }, duration)
    }

    function timerClear() {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
    }

    function isDblClick(): boolean {
        return !!timer;
    }

    function isEditing() {
        return editing;
    }

    function isDrag() {
        return isDragging;
    }

    function isElement(e: MouseEvent): boolean {
        const root = context.workspace.root;
        const scout = context.selection.scout;

        if (!scout) {
            return false;
        }

        return scout.isPointInStroke(
            context.workspace.ctrlPath,
            {x: e.clientX - root.x, y: e.clientY - root.y}
        );
    }

    function selection_watcher(t?: number | string) {
        if (t === Selection.CHANGE_SHAPE) { // 选中的图形发生改变，初始化控件
            initController();
            editing = false;
            context.workspace.contentEdit(false);
        }
    }

    function checkStatus() {
        const workspace = context.workspace;
        if (!workspace.isPreToTranslating) {
            return;
        }

        const start = workspace.startPoint;
        if (!start) {
            return;
        }

        pre_to_translate(start);

        workspace.preToTranslating(false);
    }

    function windowBlur() {
        transporter?.fulfil();
        transporter = undefined;
        isDragging = false;
        context.workspace.setCtrl('page');
        timerClear();
        context.cursor.cursor_freeze(false);
    }

    function init() {
        context.selection.watch(selection_watcher);
        checkStatus();
        window.addEventListener('blur', windowBlur);
        document.addEventListener('mousedown', mousedown);
        initController();
        context.workspace.contentEdit(false);
        context.workspace.preToTranslating(false);
    }

    function dispose() {
        context.selection.unwatch(selection_watcher);
        window.removeEventListener('blur', windowBlur);
        document.removeEventListener('mousedown', mousedown);
        timerClear();
    }

    return {isDblClick, isEditing, isDrag, init, dispose};
}

export function useController(context: Context) {
    const {t} = useI18n();

    const ctrl = useControllerCustom(context, t);

    onMounted(() => {
        ctrl.init();
    })
    onUnmounted(() => {
        ctrl.dispose();
    })
    return ctrl;
}