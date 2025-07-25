/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import {
    AsyncPathEditor,
    AsyncTransfer, ContactLineView,
    CurvePoint,
    Matrix,
    PathShapeView,
    PathType,
    ShapeView,
} from '@kcaitech/vextra-core';
import { onMounted, onUnmounted } from "vue";
import { Context } from "@/context";
import { ClientXY, PageXY, Selection } from "@/context/selection";
import { is_layers_tree_unit, selection_penetrate } from "@/utils/scout";
import { WorkSpace } from "@/context/workspace";
import { useI18n } from 'vue-i18n';
import {
    add_blur_for_window,
    check_drag_action,
    down_while_is_text_editing,
    is_ctrl_element,
    is_mouse_on_content,
    modify_down_position,
    remove_blur_from_window,
    remove_move_and_up_from_document,
    update_comment
} from "@/utils/mouse";
import { forbidden_to_modify_frame, scout_once } from '@/utils/common';
import { permIsEdit } from "@/utils/permission";
import { DBL_CLICK } from "@/const";
import { Translate2 } from "@/transform/translate/translate2";
import { Action } from "@/context/tool";
import { ActionMode, Direction, DirectionCalc } from "@/transform/direction";
import { multi_select_shape } from "@/utils/listview";
import { KeyboardMgr } from '@/keyboard';

export function useControllerCustom(context: Context, i18nT: Function) {
    const matrix = new Matrix();
    const direction = new Direction(context);

    let timer: any;
    const duration: number = DBL_CLICK;
    let isDragging = false;
    let startPosition: ClientXY = {x: 0, y: 0};
    let startPositionOnPage: PageXY = {x: 0, y: 0};
    let shapes: ShapeView[] = [];
    let need_update_comment: boolean = false;
    const selection = context.selection;
    const workspace = context.workspace;
    const directionCalc: DirectionCalc = new DirectionCalc();

    let asyncTransfer: AsyncTransfer | undefined = undefined;
    let asyncPathEditor: AsyncPathEditor | undefined = undefined;

    let translate2: Translate2 | undefined = undefined;

    function handleDblClick() {
        const selected = selection.selectedShapes;
        if (selected.length !== 1) return;

        const shape = selected[0];

        if (is_layers_tree_unit(shape)) {
            const target = selection_penetrate(selection.scout!, shape, startPositionOnPage);
            if (target) selection.selectShape(target);
            return;
        }

        if (context.tool.isLabel) return;

        if (shape.pathType) {
            if (forbidden_to_modify_frame(shape) || !permIsEdit(context) || shape instanceof ContactLineView) return;
            context.tool.setAction(Action.AutoV);
            workspace.setPathEditMode(true); // --开启对象编辑
            context.escstack.save('path-edit', exit_edit_mode);
        }
    }

    function keydown(event: KeyboardEvent) {
        // 不处理输入框内的键盘事件
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;

        if (isDragging) return;

        if (!directionCalc.is_catfish(event.code)) return;

        if (event.altKey) {
            event.preventDefault();
            context.workspace.notify(WorkSpace.SELECTION_VIEW_UPDATE);
        }

        keydown_action(event);
    }

    function keydown_action(event: KeyboardEvent) {
        if (direction.mode === ActionMode.Edit) {
            keydown_action_for_path_edit(event);
        }
    }

    function keydown_action_for_path_edit(event: KeyboardEvent) {
        const pathshape = context.selection.pathshape;
        if (!pathshape) {
            return;
        }
        //
        const selected = context.path.syntheticPoints;
        if (!selected?.size) {
            return;
        }
        //
        if (!asyncPathEditor) {
            directionCalc.reset();

            asyncPathEditor = context.editor
                .controller()
                .asyncPathEditor(pathshape as PathShapeView, selection.selectedPage!)
        }
        //
        if (!asyncPathEditor) return;
        //
        directionCalc.down(event);
        //
        let {x, y} = directionCalc.calc();

        const keys = Array.from(selected.keys());
        const values = Array.from(selected.values());
        //
        let firstPoint: CurvePoint | undefined = undefined;

        if (pathshape.pathType === PathType.Editable) {
            const __points = (pathshape as PathShapeView)?.segments[keys[0]]?.points;
            if (!__points) return;
            firstPoint = __points[values[0][0]] as CurvePoint;
        }
        //
        if (!firstPoint) return;
        //
        const m = pathshape.matrix2Root();
        m.preScale(pathshape.frame.width, pathshape.frame.height);

        const _firstPoint = m.computeCoord3(firstPoint);

        _firstPoint.x += x;
        _firstPoint.y += y;

        const __firstPointTarget = m.inverseCoord(_firstPoint);

        asyncPathEditor.execute2(selected, __firstPointTarget.x - firstPoint.x, __firstPointTarget.y - firstPoint.y);
    }

    function abortTransact() {
        if (asyncTransfer) {
            asyncTransfer.abort();
            asyncTransfer = undefined;
        }

        if (asyncPathEditor) {
            asyncPathEditor.abort();
            asyncPathEditor = undefined;
        }
    }

    function keyup(event: KeyboardEvent) {
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) { // 不处理输入框内的键盘事件
            return;
        }

        const still_active = directionCalc.up(event);

        if (still_active) {
            return;
        }

        if (asyncTransfer) {
            asyncTransfer.close();
            asyncTransfer = undefined;
        }

        if (asyncPathEditor) {
            asyncPathEditor.close();
            asyncPathEditor = undefined;
        }

    }

    function exit_edit_mode() {
        const al = context.workspace.is_path_edit_mode;
        workspace.setPathEditMode(false);
        return al;
    }

    function mousedown(e: MouseEvent) {
        if (workspace.isEditing
            && is_mouse_on_content(e)
            && down_while_is_text_editing(context)
        ) return;

        if (workspace.isPageDragging) return;

        matrix.reset(workspace.matrix.inverse);

        modify_down_position(e, context, startPosition, startPositionOnPage, matrix);
        if (is_ctrl_element(e, context)) {
            if (timer) handleDblClick();
            initTimer();
            pre_to_translate(e);
        } else if (is_mouse_on_content(e)) {
            on_content(e);
        }
    }

    async function mousemove(e: MouseEvent) {
        if (e.buttons !== 1) return;

        const mousePosition: ClientXY = workspace.getContentXY(e);
        if (isDragging) {
            translate2?.execute(e);
        } else if (check_drag_action(startPosition, mousePosition)) {
            if (asyncTransfer || isDragging) return;

            if (!shapes.length) return;

            translate2?.connect();

            isDragging = true;
        }
    }

    function mouseup(e: MouseEvent) {
        if (e.button !== 0) return;

        if (isDragging) {
            isDragging = false;
        } else {
            if (is_mouse_on_content(e)) shapes_picker(e, context, startPositionOnPage);
        }

        translate2?.fulfil();
        translate2 = undefined;

        remove_move_and_up_from_document(mousemove, mouseup);
        need_update_comment = update_comment(context, need_update_comment);
    }

    let drop: ShapeView | undefined;

    function on_content(e: MouseEvent) {
        const h = selection.hoveredShape;
        if (h) {
            if (e.shiftKey) {
                drop = h;
                multi_select_shape(context, h);
            } else {
                selection.selectShape(h);
            }
            pre_to_translate(e);
        } else {
            selection.resetSelectShapes();
        }
    }

    function shapes_picker(e: MouseEvent, context: Context, p: { x: number, y: number }) {
        const selection = context.selection;
        const selected = selection.selectedShapes;
        const hoveredShape = selection.hoveredShape;

        if (hoveredShape) {
            if (e.shiftKey) {
                multi_select_shape(context, hoveredShape);
            } else {
                selection.selectShape(hoveredShape);
            }
            return;
        }

        if (selected.length > 1) {
            const shape = selection.getShapesByXY(p, e.metaKey || e.ctrlKey, selected);
            if (shape) {
                if (e.shiftKey) {
                    const exist = selected.find(s => s.id === shape.id);
                    if (exist && exist.id !== drop?.id) {
                        selection.unSelectShape(exist);
                        scout_once(context, e);
                    }
                } else {
                    selection.selectShape(shape);
                }
            } else {
                selection.resetSelectShapes();
            }
        }
    }

    function pre_to_translate(e: MouseEvent) {
        document.addEventListener('mouseup', mouseup);
        if (!context.workspace.can_translate(e)) return;
        translate2 = new Translate2(context, e, selection.selectedShapes);
        document.addEventListener('mousemove', mousemove);
        shapes = selection.selectedShapes;
    }

    function checkStatus() {
        if (!workspace.isPreToTranslating) {
            return;
        }

        const start = workspace.startPoint;
        if (!start) {
            return;
        }

        matrix.reset(workspace.matrix.inverse);

        modify_down_position(start, context, startPosition, startPositionOnPage, matrix);

        pre_to_translate(start);

        workspace.preToTranslating(false);
        need_update_comment = true;
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
        return Boolean(timer);
    }

    function isDrag() {
        return isDragging;
    }

    function exit() {
        const len = context.selection.selectedShapes.length;
        context.selection.resetSelectShapes();
        return !!len;
    }

    function selection_watcher(t: number | string) {
        if (t === Selection.CHANGE_SHAPE) { // 选中的图形发生改变，初始化控件            
            initController();
            direction.clear();
            workspace.contentEdit(false);
        }
    }

    function workspace_watcher(t: number, param1: MouseEvent) {
        if (t === WorkSpace.CHECKSTATUS) {
            checkStatus();
        }
    }

    function windowBlur() {
        if (isDragging) {
            if (asyncPathEditor) {
                asyncPathEditor.close();
                asyncPathEditor = undefined;
                directionCalc.reset();
            }

            isDragging = false;

            translate2?.fulfil();
            translate2 = undefined;

            remove_move_and_up_from_document(mousemove, mouseup);
        }
        timerClear();
    }
    const boardMgr = new KeyboardMgr(context);
    function init() {
        shapes = selection.selectedShapes;
        workspace.watch(workspace_watcher);
        selection.watch(selection_watcher);
        add_blur_for_window(windowBlur);
        boardMgr.addEventListener('keydown', keydown);
        boardMgr.addEventListener('keyup', keyup);
        document.addEventListener('mousedown', mousedown);
        checkStatus();
        initController();
        workspace.contentEdit(false);

        if (!context.escstack.has('select-shape')) {
            context.escstack.save('select-shape', exit);
        }
    }

    function dispose() {
        workspace.unwatch(workspace_watcher);
        selection.unwatch(selection_watcher);
        direction.destroy();
        remove_blur_from_window(windowBlur);
        boardMgr.removeEventListener('keydown', keydown);
        boardMgr.removeEventListener('keyup', keyup);
        document.removeEventListener('mousedown', mousedown);
        timerClear();
        abortTransact();
    }

    return {isDblClick, isDrag, init, dispose};
}

export function useController(context: Context) {
    const {t} = useI18n();

    const ctrl = useControllerCustom(context, t);
    onMounted(ctrl.init);
    onUnmounted(ctrl.dispose);
    return ctrl;
}