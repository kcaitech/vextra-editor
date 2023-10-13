import {Shape, ShapeType, GroupShape} from '@kcdesign/data';
import {onMounted, onUnmounted} from "vue";
import {Context} from "@/context";
import {Matrix} from '@kcdesign/data';
import {ClientXY, PageXY} from "@/context/selection";
import {fourWayWheel, Wheel, EffectType} from "@/utils/wheel";
import {get_speed, keyboardHandle as handle} from "@/utils/controllerFn";
import {Selection} from "@/context/selection";
import {groupPassthrough} from "@/utils/scout";
import {WorkSpace} from "@/context/workspace";
import {AsyncTransfer} from "@kcdesign/data";
import {debounce} from "lodash";
import {paster_short} from '@/utils/clipboard';
import {sort_by_layer} from '@/utils/group_ungroup';
import {useI18n} from 'vue-i18n';
import {map_from_shapes} from '@/utils/content';
import {
    distance2apex,
    distance2apex2,
    get_frame,
    get_pg_by_frame,
    gen_match_points,
    PointsOffset, get_apex, pre_render_assist_line
} from '@/utils/assist';
import {Asssit} from '@/context/assist';
import {TaskType} from '@/context/escstack';
import {
    add_blur_for_window,
    add_move_and_up_for_document,
    check_drag_action,
    down_while_is_text_editing, end_transalte, gen_assist_target, gen_offset_map, get_closest_container,
    get_current_position_client,
    is_ctrl_element,
    is_mouse_on_content, is_rid_stick,
    modify_down_position,
    modify_mouse_position_by_type,
    remove_blur_from_window,
    remove_move_and_up_from_document, reset_assist_before_translate, shapes_picker,
    shutdown_menu, update_comment
} from "@/utils/mouse";

export function useControllerCustom(context: Context, i18nT: Function) {
    const matrix = new Matrix();
    let timer: any;
    const duration: number = 250; // 双击判定时长 ms
    let isDragging = false;
    let startPosition: ClientXY = {x: 0, y: 0};
    let startPositionOnPage: PageXY = {x: 0, y: 0};
    let wheel: Wheel | undefined = undefined;
    let editing: boolean = false;
    let shapes: Shape[] = [];
    let asyncTransfer: AsyncTransfer | undefined = undefined;
    let need_update_comment: boolean = false;
    let t_e: MouseEvent | undefined;
    let speed: number = 0;
    const selection = context.selection;
    const workspace = context.workspace;
    let offset_map: PointsOffset | undefined;

    function _migrate(shapes: Shape[], start: ClientXY, end: ClientXY) {
        if (shapes.length) {
            const pe: PageXY = matrix.computeCoord3(end);
            const map = map_from_shapes(shapes);
            const targetParent = selection.getClosetArtboard(pe, map);
            const emit_migrate = get_closest_container(context, shapes[0]).id !== targetParent.id;
            if (emit_migrate && asyncTransfer) {
                shapes = sort_by_layer(context, shapes);
                asyncTransfer.migrate(targetParent as GroupShape);
                context.assist.set_collect_target([targetParent as GroupShape], true);
            }
        }
    }

    const migrate: (shapes: Shape[], start: ClientXY, end: ClientXY) => void = debounce(_migrate, 100);


    /**
     * @description 双击控件
     */
    function handleDblClick() {
        const selected = selection.selectedShapes;
        if (selected.length !== 1) return;
        const shape = selected[0];
        if ([ShapeType.Group, ShapeType.FlattenShape].includes(shape.type)) {
            const scope = (shape as GroupShape).childs;
            const scout = selection.scout;
            if (!scout) return;
            const target = groupPassthrough(scout, scope, startPositionOnPage);
            if (target) selection.selectShape(target);
        } else {
            editing = !editing;
            workspace.contentEdit(editing);
        }
    }

    function mousedown(e: MouseEvent) {
        if (workspace.isEditing && is_mouse_on_content(e) && down_while_is_text_editing(e, context)) return;
        if (workspace.isPageDragging) return;
        if (is_ctrl_element(e, context)) {
            if (timer) handleDblClick();
            initTimer();
            pre_to_translate(e);
        } else if (is_mouse_on_content(e)) {
            const h = selection.hoveredShape;
            if (h) {
                selection.selectShape(h);
                pre_to_translate(e);
            } else {
                selection.resetSelectShapes();
            }
        }
    }

    function pre_to_translate(e: MouseEvent) { // 移动之前做的准备
        shutdown_menu(e, context);
        if (!context.workspace.can_translate(e)) return;
        shapes = selection.selectedShapes;
        matrix.reset(workspace.matrix.inverse);
        modify_down_position(e, context, startPosition, startPositionOnPage, matrix);
        wheel = fourWayWheel(context, undefined, startPositionOnPage);
        workspace.setCtrl('controller');
        add_move_and_up_for_document(mousemove, mouseup);
    }

    function mousemove(e: MouseEvent) {
        if (e.buttons !== 1) return;
        const mousePosition: ClientXY = get_current_position_client(context, e);
        if (isDragging && !editing && wheel && asyncTransfer) {
            speed = get_speed(t_e || e, e);
            t_e = e;
            let update_type = 0;
            const isOut = wheel.moving(e, {type: EffectType.TRANS, effect: asyncTransfer.transByWheel});
            if (!isOut) update_type = transform(startPosition, mousePosition);
            modify_mouse_position_by_type(update_type, startPosition, mousePosition);
        } else if (check_drag_action(startPosition, mousePosition) && !editing) {
            if (e.altKey) shapes = paster_short(context, shapes);
            reset_assist_before_translate(context, shapes);
            offset_map = gen_offset_map(shapes[0], startPosition, matrix);
            isDragging = true;
            asyncTransfer = context.editor.controller().asyncTransfer(shapes, selection.selectedPage!);
        }
    }

    function transform(start: ClientXY, end: ClientXY) {
        const ps: PageXY = matrix.computeCoord3(start);
        const pe: PageXY = matrix.computeCoord3(end);
        let update_type = 0;
        if (asyncTransfer) {
            update_type = trans_assistant(asyncTransfer, ps, pe);
            migrate(shapes, start, end);
        }
        return update_type;
    }

    let pre_target_x: number, pre_target_y: number;
    let stickedX: boolean = false, stickedY: boolean = false;

    /**
     * @description 计算对齐辅助线、辅助对齐
     */
    function trans_assistant(asyncTransfer: AsyncTransfer, ps: PageXY, pe: PageXY): number {
        // const s1 = Date.now();
        let update_type = 3;
        if (speed > 5) { // 如果速度过快，不进行移动辅助
            asyncTransfer.trans(ps, pe);
            context.assist.notify(Asssit.CLEAR);
            return update_type;
        }
        if (!offset_map) return update_type;
        let need_multi = 0;
        const stick = {dx: 0, dy: 0, sticked_x: false, sticked_y: false};
        const len = shapes.length;
        const shape = shapes[0];
        const target = gen_assist_target(context, offset_map, pe, shapes);
        if (!target) return update_type;
        let inverse_matrix: Matrix | undefined;
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
        // console.log('一次辅助线从计算到渲染总共用时', Date.now() - s1); // < 3ms
        return update_type;

        function modify_fix_x(target: any) {
            pre_target_x = target.x;
            const apex = get_apex(context, shape, len > 1, target.alignX); // 确定吸附点位置
            const trans_x = target.x - apex; // 计算到达吸附点需要的距离
            stick.dx = trans_x;
            stick.sticked_x = true;
            stick.dy = pe.y - ps.y;
            pe.x = ps.x + trans_x;
            if (!inverse_matrix) {
                inverse_matrix = workspace.matrix;
            }
            const t = inverse_matrix.computeCoord3(pe);
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
            if (!inverse_matrix) {
                inverse_matrix = workspace.matrix;
            }
            const t = inverse_matrix.computeCoord3(pe);
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
        if (e.button !== 0) return;
        if (isDragging) {
            if (asyncTransfer) {
                const mousePosition: ClientXY = get_current_position_client(context, e);
                _migrate(shapes, startPosition, mousePosition);
                asyncTransfer = asyncTransfer.close();
            }
            end_transalte(context);
            reset_sticked();
            isDragging = false;
        } else {
            shapes_picker(e, context, startPositionOnPage);
        }
        workspace.setCtrl('page');
        if (wheel) wheel = wheel.remove();
        remove_move_and_up_from_document(mousemove, mouseup);
        need_update_comment = update_comment(context, need_update_comment);
    }

    function checkStatus() {
        if (workspace.isPreToTranslating) {
            const start = workspace.startPoint;
            if (!start) return;
            pre_to_translate(start);
            workspace.preToTranslating(false);
            need_update_comment = true;
        }
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

    function isEditing() {
        return editing;
    }

    function isDrag() {
        return isDragging;
    }

    function exit() {
        const len = context.selection.selectedShapes.length;
        context.selection.resetSelectShapes();
        return !!len;
    }

    function keyboardHandle(e: KeyboardEvent) {
        handle(e, context, i18nT);
    }

    function selection_watcher(t?: number) {
        if (t === Selection.CHANGE_SHAPE) { // 选中的图形发生改变，初始化控件
            const selected = selection.selectedShapes;
            if (selected.length === 1) {
                const type = selected[0].type;
                if (type === ShapeType.Table || type === ShapeType.Contact) return dispose();
            }
            initController();
            editing = false;
            workspace.contentEdit(false);
        }
    }

    function workspace_watcher(t?: number) {
        if (t === WorkSpace.CHECKSTATUS) checkStatus();
    }

    function windowBlur() {
        if (isDragging) { // 窗口失焦,此时鼠标事件(up,move)不再受系统管理, 此时需要手动关闭已开启的状态
            remove_move_and_up_from_document(mousemove, mouseup);
            if (asyncTransfer) asyncTransfer = asyncTransfer.close();
            isDragging = false;
            end_transalte(context);
            reset_sticked();
            workspace.setCtrl('page');
        }
        if (wheel) wheel = wheel.remove();
        timerClear();
    }

    function init() {
        shapes = selection.selectedShapes;
        workspace.watch(workspace_watcher);
        selection.watch(selection_watcher);
        add_blur_for_window(windowBlur);
        document.addEventListener('keydown', keyboardHandle);
        document.addEventListener('mousedown', mousedown);
        checkStatus();
        initController();
        workspace.contentEdit(false);
        context.esctask.save(TaskType.SELECTION, exit);
    }

    function dispose() {
        workspace.unwatch(workspace_watcher);
        selection.unwatch(selection_watcher);
        remove_blur_from_window(windowBlur);
        document.removeEventListener('keydown', keyboardHandle);
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