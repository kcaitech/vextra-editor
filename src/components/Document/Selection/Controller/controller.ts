import { AsyncPathEditor, ShapeView, adapt2Shape, PathShapeView, Page, Shape } from '@kcdesign/data';
import { onMounted, onUnmounted } from "vue";
import { Context } from "@/context";
import { Matrix } from '@kcdesign/data';
import { ClientXY, PageXY } from "@/context/selection";
import { fourWayWheel, Wheel, EffectType } from "@/utils/wheel";
import { DirectionCalc, get_speed, modify_shapes } from "@/utils/controllerFn";
import { Selection } from "@/context/selection";
import { is_layers_tree_unit, selection_penetrate } from "@/utils/scout";
import { WorkSpace } from "@/context/workspace";
import { AsyncTransfer } from "@kcdesign/data";
import { paster_short } from '@/utils/clipboard';
import { useI18n } from 'vue-i18n';
import {
    PointsOffset, get_apex, pre_render_assist_line
} from '@/utils/assist';
import { Asssit } from '@/context/assist';
import {
    add_blur_for_window,
    check_drag_action,
    down_while_is_text_editing,
    end_transalte,
    gen_assist_target,
    gen_offset_points_map,
    is_ctrl_element,
    is_mouse_on_content,
    is_rid_stick,
    modify_down_position,
    modify_mouse_position_by_type,
    remove_blur_from_window,
    remove_move_and_up_from_document,
    reset_assist_before_translate,
    shapes_picker,
    shutdown_menu,
    update_comment
} from "@/utils/mouse";
import { find_except_envs, migrate_immediate, migrate_once, record_origin_env } from "@/utils/migrate";
import { forbidden_to_modify_frame, shapes_organize } from '@/utils/common';
import { TranslateHandler } from '@/transform/translate';

export function useControllerCustom(context: Context, i18nT: Function) {
    const matrix = new Matrix();
    let timer: any;
    const duration: number = 250; // 双击判定时长 ms
    let isDragging = false;
    let startPosition: ClientXY = { x: 0, y: 0 };
    let startPositionOnPage: PageXY = { x: 0, y: 0 };
    let wheel: Wheel | undefined = undefined;
    let shapes: ShapeView[] = [];
    let need_update_comment: boolean = false;
    let t_e: MouseEvent | undefined;
    let speed: number = 0;
    const selection = context.selection;
    const workspace = context.workspace;
    let offset_map: PointsOffset | undefined;
    const directionCalc: DirectionCalc = new DirectionCalc();

    let asyncTransfer: AsyncTransfer | undefined = undefined;
    let asyncPathEditor: AsyncPathEditor | undefined = undefined;

    let transporter: TranslateHandler | undefined = undefined;

    function handleDblClick() {
        const selected = selection.selectedShapes;
        if (selected.length !== 1) {
            return;
        }

        const shape = selected[0];

        if (is_layers_tree_unit(shape)) {
            const target = selection_penetrate(selection.scout!, shape, startPositionOnPage);
            if (target) {
                selection.selectShape(target);
            }
            return;
        }

        if (context.tool.isLable) {
            return;
        }

        if (shape instanceof PathShapeView) {
            if (forbidden_to_modify_frame(shape)) {
                return;
            }

            workspace.setPathEditMode(true); // --开启对象编辑
            context.esctask.save('path-edit', exist_edit_mode);
        }
    }

    function keydown(event: KeyboardEvent) {
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) { // 不处理输入框内的键盘事件
            return;
        }

        if (isDragging) {
            return;
        }

        if (!directionCalc.is_catfish(event.code)) {
            return;
        }

        keydown_action(event);
    }

    function keydown_action(event: KeyboardEvent) {
        const mode = context.workspace.is_path_edit_mode;
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

        const points = context.path.syntheticPoints;
        if (!points?.length) {
            return;
        }

        if (!asyncPathEditor) {
            directionCalc.reset();

            asyncPathEditor = context.editor
                .controller()
                .asyncPathEditor(pathshape, selection.selectedPage!)
        }

        if (!asyncPathEditor) {
            return;
        }

        directionCalc.down(event);

        let { x, y } = directionCalc.calc();

        x = x / pathshape.frame.width;
        y = y / pathshape.frame.height;

        asyncPathEditor.execute2(points, x, y);
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

        const { x, y } = directionCalc.calc();

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
        //
        // if (event.code === 'ShiftLeft') {
        //     transporter?.modifyShiftStatus(false);
        // }

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
        ) {
            return;
        }

        if (workspace.isPageDragging) {
            return;
        }

        matrix.reset(workspace.matrix.inverse);

        modify_down_position(e, context, startPosition, startPositionOnPage, matrix);

        if (is_ctrl_element(e, context)) {
            if (timer) {
                handleDblClick();
            }

            initTimer();
            pre_to_translate(e);
        } else if (is_mouse_on_content(e)) {
            on_content(e);
        }
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
        shutdown_menu(e, context);

        document.addEventListener('mouseup', mouseup);

        if (!context.workspace.can_translate(e)) {
            return;
        }

        transporter = new TranslateHandler(context, e, selection.selectedShapes);
        // console.log('transporter:', transporter);

        // context.cursor.cursor_freeze(true); // 拖动过程中禁止鼠标光标切换

        document.addEventListener('mousemove', mousemove);

        shapes = selection.selectedShapes;

        wheel = fourWayWheel(context, undefined, startPositionOnPage);
        // workspace.setCtrl('controller');
    }

    async function mousemove(e: MouseEvent) {
        if (e.buttons !== 1) {
            return;
        }

        const mousePosition: ClientXY = workspace.getContentXY(e);
        if (isDragging) {
            // if (isDragging && wheel && asyncTransfer) {
            // speed = get_speed(t_e || e, e);
            // t_e = e;

            // let update_type = 0;

            // const is_need_assit = wheel.is_inner(e);

            // update_type = transform(startPosition, mousePosition, is_need_assit);

            // wheel.moving(e, { type: EffectType.TRANS, effect: asyncTransfer.transByWheel }); // 滚轮动作

            // modify_mouse_position_by_type(update_type, startPosition, mousePosition);

            transporter?.execute(e);

        } else if (check_drag_action(startPosition, mousePosition)) {
            if (asyncTransfer || isDragging) {
                return;
            }

            shapes = modify_shapes(context, shapes);

            shapes = shapes_organize(shapes);

            if (!shapes.length) {
                return;
            }

            reset_assist_before_translate(context, shapes);

            // offset_map = gen_offset_points_map(shapes, startPositionOnPage);

            // asyncTransfer = context.editor
            //     .controller()
            //     .asyncTransfer(shapes, selection.selectedPage!);


            // context.selection.setShapesSet(shapes);
            // asyncTransfer.setEnvs(record_origin_env(shapes));
            // const except_envs = find_except_envs(context, shapes, e);
            // asyncTransfer.setExceptEnvs(except_envs);
            // asyncTransfer.setCurrentEnv(except_envs[0].data as Page | Shape);

            transporter?.createApiCaller();

            // if (e.altKey) {
            //     shapes = await paster_short(context, shapes, transporter!.asyncApiCaller!);
            // }

            isDragging = true;
        }
    }

    function update_assist_by_workspace_change(event: MouseEvent) {
        matrix.reset(workspace.matrix.inverse);

        context.assist.set_trans_target(shapes);

        const root = context.workspace.root;

        const xy = matrix.computeCoord2(event.clientX - root.x, event.clientY - root.y);

        offset_map = gen_offset_points_map(shapes, xy);
    }

    function transform(start: ClientXY, end: ClientXY, assit = true) {
        const ps: PageXY = matrix.computeCoord3(start);
        const pe: PageXY = matrix.computeCoord3(end);
        let update_type = 0;

        if (!asyncTransfer) {
            return update_type;
        }

        if (!assit) {
            asyncTransfer.trans(ps, pe);
            context.assist.notify(Asssit.CLEAR);
            update_type = 3;
            return update_type;
        }

        update_type = trans_assistant(asyncTransfer, ps, pe);

        migrate_once(context, asyncTransfer, shapes, end);

        return update_type;
    }

    let pre_target_x: number;
    let pre_target_y: number;
    let stickedX: boolean = false;
    let stickedY: boolean = false;

    // let count: number = 0, times: number = 0; // 性能测试
    function trans_assistant(asyncTransfer: AsyncTransfer, ps: PageXY, pe: PageXY): number {
        // const s1 = Date.now();
        let update_type = 3;

        if (speed > 5) { // 如果速度过快，不进行移动辅助
            asyncTransfer.trans(ps, pe);
            context.assist.notify(Asssit.CLEAR);
            return update_type;
        }

        if (!offset_map) {
            return update_type;
        }

        let need_multi = 0;
        const stick = { dx: 0, dy: 0, sticked_x: false, sticked_y: false };
        const len = shapes.length;
        const shape = shapes[0];

        const target = gen_assist_target(context, shapes, len > 1, offset_map, pe);
        if (!target) {
            return update_type;
        }

        if (stickedX) {
            if (is_rid_stick(context, ps.x, pe.x)) { // 挣脱吸附
                stickedX = false;
            } else {
                if (pre_target_x === target.x) { // 还是原先的吸附点
                    pe.x = ps.x;
                    update_type -= 1;
                    need_multi += 1;
                } else if (target.sticked_by_x) { // 需要转移到另一个吸附点
                    modify_fix_x(target);
                }
            }
        } else if (target.sticked_by_x) { // 吸附
            modify_fix_x(target);
        }

        if (stickedY) {
            if (is_rid_stick(context, ps.y, pe.y)) {
                stickedY = false;
            } else {
                if (pre_target_y === target.y) {
                    pe.y = ps.y;
                    stick.dy = 0;
                    update_type -= 2;
                    need_multi += 2;
                } else if (target.sticked_by_y) {
                    modify_fix_y(target);
                }
            }
        } else if (target.sticked_by_y) {
            modify_fix_y(target);
        }

        if (stick.sticked_x || stick.sticked_y) {
            asyncTransfer.stick(stick.dx, stick.dy);
        } else {
            asyncTransfer.trans(ps, pe);
        }

        if (need_multi) {
            pre_render_assist_line(context, len > 1, shape, shapes);
        }
        // times++; // 性能测试
        // count += Date.now() - s1;
        // if (times >= 20) {
        //     console.log('一次辅助线从计算到渲染总共用时', count / times); // 大于10ms 则能感觉明显卡顿
        //     count = 0;
        //     times = 0;
        // }
        return update_type;

        function modify_fix_x(target: any) {
            pre_target_x = target.x;
            const apex = get_apex(context, shape, len > 1, target.alignX); // 确定吸附点位置
            const trans_x = target.x - apex; // 计算到达吸附点需要的距离
            stick.dx = trans_x;
            stick.sticked_x = true;
            stick.dy = pe.y - ps.y;
            pe.x = ps.x + trans_x;
            const t = workspace.matrix.computeCoord3(pe);
            startPosition.x = t.x;
            update_type -= 1;
            stickedX = true;
            need_multi += 1;
        }

        function modify_fix_y(target: any) {
            pre_target_y = target.y;
            const apex = get_apex(context, shape, len > 1, target.alignY);
            const trans_y = target.y - apex;
            stick.dy = trans_y;
            stick.sticked_y = true;
            pe.y = ps.y + trans_y;
            if (!stick.sticked_x) stick.dx = pe.x - ps.x;
            const t = workspace.matrix.computeCoord3(pe);
            startPosition.y = t.y;
            update_type -= 2;
            stickedY = true;
            need_multi += 2;
        }
    }

    function reset_sticked() {
        pre_target_x = Infinity;
        pre_target_y = Infinity;
        stickedX = false;
        stickedY = false;
    }

    function mouseup(e: MouseEvent) {
        if (e.button !== 0) {
            return;
        }

        if (isDragging) {
            isDragging = false;
        } else {
            shapes_picker(e, context, startPositionOnPage);
        }

        transporter?.fulfil();
        transporter = undefined;

        remove_move_and_up_from_document(mousemove, mouseup);
        need_update_comment = update_comment(context, need_update_comment);
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

    function selection_watcher(t: number) {
        if (t === Selection.CHANGE_SHAPE) { // 选中的图形发生改变，初始化控件            
            initController();
            workspace.contentEdit(false);
        }
    }

    function workspace_watcher(t: number, param1: MouseEvent) {
        if (t === WorkSpace.CHECKSTATUS) {
            checkStatus();
        } else if (t === WorkSpace.NEW_ENV_MATRIX_CHANGE) {
            update_assist_by_workspace_change(param1);
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
        context.esctask.save('select-shape', exit);
    }

    function dispose() {
        workspace.unwatch(workspace_watcher);
        selection.unwatch(selection_watcher);
        remove_blur_from_window(windowBlur);
        document.removeEventListener('keydown', keydown);
        document.removeEventListener('keyup', keyup);
        document.removeEventListener('mousedown', mousedown);
        timerClear();
        abortTransact();
    }

    return { isDblClick, isDrag, init, dispose };
}

export function useController(context: Context) {
    const { t } = useI18n();

    const ctrl = useControllerCustom(context, t);
    onMounted(() => {
        ctrl.init();
    })
    onUnmounted(() => {
        ctrl.dispose();
    })
    return ctrl;
}