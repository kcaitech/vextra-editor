import {
    adapt2Shape,
    AsyncPathEditor,
    AsyncTransfer, ContactLineView,
    CurvePoint,
    Matrix,
    PathShapeView,
    PathType,
    ShapeView,
} from '@kcdesign/data';
import { onMounted, onUnmounted } from "vue";
import { Context } from "@/context";
import { ClientXY, PageXY, Selection } from "@/context/selection";
import { DirectionCalc, modify_shapes } from "@/utils/controllerFn";
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
    shapes_picker,
    update_comment
} from "@/utils/mouse";
import { forbidden_to_modify_frame, shapes_organize } from '@/utils/common';
import { TranslateHandler } from '@/transform/translate';
import { permIsEdit } from "@/utils/permission";
import { DBL_CLICK } from "@/const";
import { Translate2 } from "@/transform/translate2";
import { Action } from "@/context/tool";
import { ActionMode, Direction } from "@/transform/direction";

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

    let transporter: TranslateHandler | undefined = undefined;
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

        if (context.tool.isLable) return;

        if (shape.pathType) {
            if (forbidden_to_modify_frame(shape) || !permIsEdit(context) || shape instanceof ContactLineView) return;
            context.tool.setAction(Action.AutoV);
            workspace.setPathEditMode(true); // --开启对象编辑
            context.escstack.save('path-edit', exist_edit_mode);
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
        const mode = context.workspace.is_path_edit_mode;
        if (direction.mode === ActionMode.Flex) return;
        if (mode) {
            keydown_action_for_path_edit(event);
        } else {
            keydown_action_for_trans(event);
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

    function keydown_action_for_trans(event: KeyboardEvent) {
        if (!asyncTransfer) {
            directionCalc.reset();

            shapes = modify_shapes(context, shapes);

            asyncTransfer = context.editor
                .controller()
                .asyncTransfer(shapes.map((s) => adapt2Shape(s)), selection.selectedPage!);
        }

        if (!asyncTransfer) {
            return;
        }

        directionCalc.down(event)

        const {x, y} = directionCalc.calc();

        asyncTransfer.stick(x, y);
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

    function exist_edit_mode() {
        const al = context.workspace.is_path_edit_mode;
        workspace.setPathEditMode(false);
        return al;
    }

    function mousedown(e: MouseEvent) {
        if (workspace.isEditing
            && is_mouse_on_content(e)
            && down_while_is_text_editing(e, context)
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
            // transporter?.execute(e);
            translate2?.execute(e);
        } else if (check_drag_action(startPosition, mousePosition)) {
            if (asyncTransfer || isDragging) return;

            shapes = modify_shapes(context, shapes);

            shapes = shapes_organize(shapes);

            if (!shapes.length) return;

            // transporter?.createApiCaller();
            translate2?.connect();

            isDragging = true;
        }
    }

    function mouseup(e: MouseEvent) {
        if (e.button !== 0) return;

        if (isDragging) {
            isDragging = false;
        } else {
            shapes_picker(e, context, startPositionOnPage);
        }

        // transporter?.fulfil();
        // transporter = undefined;

        translate2?.fulfil();
        translate2 = undefined;

        remove_move_and_up_from_document(mousemove, mouseup);
        need_update_comment = update_comment(context, need_update_comment);
    }

    function on_content(e: MouseEvent) {
        const h = selection.hoveredShape;
        if (h) {
            selection.selectShape(h);
            pre_to_translate(e);
        } else {
            selection.resetSelectShapes();
        }
    }

    function pre_to_translate(e: MouseEvent) {
        document.addEventListener('mouseup', mouseup);
        if (!context.workspace.can_translate(e)) return;
        // transporter = new TranslateHandler(context, e, selection.selectedShapes);
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
            transporter?.fulfil();
            transporter = undefined;

            remove_move_and_up_from_document(mousemove, mouseup);
        }
        timerClear();
    }

    function init() {
        shapes = selection.selectedShapes;
        workspace.watch(workspace_watcher);
        selection.watch(selection_watcher);
        add_blur_for_window(windowBlur);
        document.addEventListener('keydown', keydown);
        document.addEventListener('keyup', keyup);
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
        document.removeEventListener('keydown', keydown);
        document.removeEventListener('keyup', keyup);
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